var rpgPlayer;

function createRPGPlayerStats(player, api) {
    return {
        player: player,
        api: api,
        lvl: 1,
        exp: 0,
        points: 0,
        expNextLvl: 500,
        nextLvl: {
            BASE_EXP: 500,
            EXP_GROWTH_RATE: 1.12,
            EXP_FIX: 200,
            calculateExp: function (level) {
                return Math.round(
                    this.BASE_EXP * Math.pow(this.EXP_GROWTH_RATE, level) + this.EXP_FIX * level);
            },
        },
        abitity: {
            health: {
                BASE_HP: 8,
                endurance: 1,
                HP_GROWTH_RATE: 0.05,
                LINEAR_HP_GAIN: 1,
                ENDURANCE_MULTIPLIER: 3,
                calculateMaxHp: function (level) {
                    return Math.round((this.HP_GROWTH_RATE * level * level + this.LINEAR_HP_GAIN * level + this.BASE_HP) + (this.ENDURANCE_MULTIPLIER * this.endurance));
                },
            },
            strength: 5,
            agility: 5,
            intelligence: 5,
        },
        giveXpAndPoint: function (countXp, countPoint) {
            this.exp += countXp;
            this.points += countPoint;
            this.api.executeCommand(
                this.player.world,
                '/title ' + this.player.getName() + ' actionbar ' +
                '{"text":"« опыт +' + countXp + ' | кровавая эссенция +' + countPoint + ' »", "color":"green"}'
            );
            this.givePlayerLvl()
        },
        givePlayerLvl: function () {
            while (this.exp >= this.expNextLvl) {
                this.lvl++;
                this.exp -= this.expNextLvl
                this.expNextLvl = this.nextLvl.calculateExp(this.lvl);
                this.player.message("Вы получили " + this.lvl + " уровень! Чтобы получить следующий уровень, нужно набрать " + this.expNextLvl + " опыта")
                this.updateHpAndEndurance()
            }
        },
        processXpAndPointQueue: function () {
            var temp = this.player.getTempdata();
            if (temp.has("xpQueue") && temp.has("pointQueue")) {
                var xpQueue = temp.get("xpQueue");
                var pointQueue = temp.get("pointQueue");
                if (xpQueue.length > 0 && pointQueue.length > 0) {
                    var xp = xpQueue.shift();
                    var point = pointQueue.shift();
                    this.giveXpAndPoint(xp, point);
                    temp.put("xpQueue", xpQueue);
                    temp.put("pointQueue", pointQueue);
                }
            }
        },
        updateHpAndEndurance: function () {
            if (this.lvl % 3 === 0) {
                this.abitity.health.endurance++
                this.player.message("Выносливость увеличена! Текущая: " + this.abitity.health.endurance);
            }
            var newHp = this.abitity.health.calculateMaxHp(this.lvl)
            this.player.setMaxHealth(newHp);
            this.player.setHealth(newHp);
        },
    }
}

function init(e) {
    var player = e.player;
    var api = e.API;
    rpgPlayer = createRPGPlayerStats(player, api)
    rpgPlayer.updateHpAndEndurance()
}

function tick(e) {
    if (rpgPlayer) {
        rpgPlayer.processXpAndPointQueue()
    }
}
// Подключаем событие нажатия клавиши

function keyPressed(e) {
    var player = e.player;  // Получаем игрока
    var key = e.key;             // Получаем код нажатой клавиши напрямую из e.key

    // Если нажата клавиша X (код клавиши 45)
    if (key === 88) {
        player.message(
            "\nУровень: " + rpgPlayer.lvl +
            "\nОпыт: " + rpgPlayer.exp +
            "\nПоинты: " + rpgPlayer.points +
            "\nОпыт до следущего уровня: " + rpgPlayer.expNextLvl +
            "\nВыносливость: " + rpgPlayer.abitity.health.endurance)
    }
}


// function attack(e) {
//     if (e.target) {
//         e.target.damage(5);
//     }
// }