var rpgPlayer;

/*
function getRPGPlayer(player, api) {
    var tempData = player.getTempdata();

    if (!tempData.has("rpgPlayer")) {
        var rpg = new CharacterUpgrade(player, api);
        tempData.put("rpgPlayer", rpg);
    }
    return tempData.get("rpgPlayer");
}
*/

//Класс игрока с характеристиками
function Player(player, api) {
    this.player = player;
    this.api = api;

    this.storedPlayer = this.player.getStoreddata();
    this.tempPlayer = this.player.getTempdata();
    this.nbt = this.player.getNbt();
}
//Массив со всеми характерстиками
Player.prototype.getValuesCharacter = function () {
    return {
        "Уровень": this.lvl,
        "Опыт": this.exp,
        "Опыт до следущего уровня": this.expNextLvl,
        "Кровавые эссенций": this.points,
        "Здоровье": this.calcMaxHP(),
        "Сила": this.characteristics.strength,
        "Ловкость": this.characteristics.agility,
        "Кровожадность": this.characteristics.bloodthirstiness,
        "Живучесть": this.characteristics.survivability,
    }
};

//Устанавливает половину HP и энергии после смерти
Player.prototype.diedPlayer = function () {
    this.maxEnergy = this.calcMaxEnergy();
    var maxHP = this.calcMaxHP();

    // Половина энергии
    this.energy = Math.floor(this.maxEnergy / 2);

    // Тут всё норм с хп, оставляем как есть
    this.player.setMaxHealth(maxHP);

    // Обновляем оверлей (чтобы HUD видел изменения)
    this.updateOverlay("energychange", this.energy);
    this.updateOverlay("maxenergychange", this.maxEnergy);

    this.save();
}


//Метод для получения данных
Player.prototype.hasAndGetStoredPlayer = function (name, defaultMeaning) {
    return this.storedPlayer.has(name) ? this.storedPlayer.get(name) : defaultMeaning
}

//Обновления оверлея
Player.prototype.updateOverlay = function (command, element) {
    this.api.executeCommand(
        this.player.world,
        command + " " + this.player.getName() + " " + element
    );
}

//Всплывающия сообщения на экране
Player.prototype.showFloatingText = function (message, color) {
    this.api.executeCommand(
        this.player.world,
        "showfloating " + message + " " + color
    );
}

//Сохраняет данные в сессий
Player.prototype.save = function () {
    this.storedPlayer.put("lvl", this.lvl);
    this.storedPlayer.put("exp", this.exp);
    this.storedPlayer.put("expNextLvl", this.expNextLvl);
    this.storedPlayer.put("points", this.points);

    this.storedPlayer.put("energy", this.energy);
    this.storedPlayer.put("maxEnergy", this.maxEnergy);

    this.storedPlayer.put("strength", this.characteristics.strength);
    this.storedPlayer.put("agility", this.characteristics.agility);
    this.storedPlayer.put("bloodthirstiness", this.characteristics.bloodthirstiness);
    this.storedPlayer.put("survivability", this.characteristics.survivability);
}


//_________________ОПЫТ, ПОИНТЫ И УРОВЕНЬ_______________________

function LevelSystem(player, api) {
    Player.call(this, player, api);
    this.lvl = this.hasAndGetStoredPlayer("lvl", 0);
    this.exp = this.hasAndGetStoredPlayer("exp", 0);
    this.expNextLvl = this.hasAndGetStoredPlayer("expNextLvl", 500);
    this.maxLvl = 40;
}
LevelSystem.prototype = Object.create(Player.prototype);
LevelSystem.prototype.constructor = LevelSystem;

//Проверяет опыт если есть то дают игроку и удаляется из псевдомассива(tempdata)
LevelSystem.prototype.syncExp = function () {
    if (this.tempPlayer.has("xpQueue") && this.tempPlayer.has("pointQueue")) {
        var xpQueue = this.tempPlayer.get("xpQueue");
        var pointQueue = this.tempPlayer.get("pointQueue");

        if (xpQueue.length > 0 && pointQueue.length > 0) {
            var xp = xpQueue.shift();
            var point = pointQueue.shift();
            this.giveExpAndPoint(xp, point)
            this.tempPlayer.put("xpQueue", xpQueue);
            this.tempPlayer.put("pointQueue", pointQueue);
        }
    }
}

// Получение опыта и поинтов
LevelSystem.prototype.giveExpAndPoint = function (countExp, countPoint) {
    this.exp += countExp;
    this.points += countPoint;

    this.showFloatingText("Опыт + " + countExp + " | " + "Кровавые поинты + " + countPoint, "green");
    if (this.lvl < this.maxLvl) {
        this.updateLvl();
    }
    this.save();
}

//Метод повышение уровня
LevelSystem.prototype.updateLvl = function () {
    //Цикл работает если опыт больше чем опыт для следущего уровня
    while (this.exp >= this.expNextLvl && this.lvl < this.maxLvl) {
        this.exp -= this.expNextLvl;
        this.lvl++;
        this.player.setExpLevel(this.lvl);
        this.expNextLvl = this.calcLvl()
        this.updateHP(true);
        this.energyUpdate(true);
        this.player.message("§aНовый уровень: " + this.lvl + " | До следующего: " + this.expNextLvl);
        if (this.expNextLvl !== "∞" && this.lvl == this.maxLvl) {
            this.expNextLvl = "∞";
        }
    }
};

//Формула для уровня 
LevelSystem.prototype.calcLvl = function () {
    return Math.round(
        500 * Math.pow(1.12, this.lvl) + 200 * this.lvl
    );
}

//________________ХАРАКТЕРИСТИКИ_________________________

function CharacteristicsSystem(player, api) {
    LevelSystem.call(this, player, api);
    this._baseHP = 15;

    this.points = this.hasAndGetStoredPlayer("points", 0);

    this.characteristics = {
        strength: this.hasAndGetStoredPlayer("strength", 1),
        agility: this.hasAndGetStoredPlayer("agility", 1),
        bloodthirstiness: this.hasAndGetStoredPlayer("bloodthirstiness", 1),
        survivability: this.hasAndGetStoredPlayer("survivability", 1),
    };
}
CharacteristicsSystem.prototype = Object.create(LevelSystem.prototype);
CharacteristicsSystem.prototype.constructor = CharacteristicsSystem;

//------------ПРОКАЧКА ХАРАКТЕРИСТИК-----------
//Проверка соответствующего уровня (Через 3) | 2.1
CharacteristicsSystem.prototype.getRequiredLevel = function (statName) {
    var currentStatLevel = this.characteristics[statName] || 1;
    if (currentStatLevel <= 2) {
        return 1;
    }
    var requiredLevel = 3 * Math.ceil((currentStatLevel - 2) / 3) + 3;
    return requiredLevel;
};

//Проверка хватает ли поинтов для прокачки | 2.2
CharacteristicsSystem.prototype.getCaclPoint = function (statName) {
    var statValue = this.characteristics[statName] || 0;
    return Math.round(250 * Math.pow(1.12, statValue) + 200 * statValue);
};

//Сбрасывает все значения до начальних
CharacteristicsSystem.prototype.reset = function () {
    this.lvl = 0;
    this.player.setExpLevel(0);
    this.exp = 0;
    this.expNextLvl = 500;
    this.points = 0;

    this.characteristics.strength = 1;
    this.characteristics.agility = 1;
    this.characteristics.bloodthirstiness = 1;
    this.characteristics.survivability = 1;

    this.energy = 10;
    this.maxEnergy = 10;

    this.save()
    this.updateHP(true)
    this.energyUpdate(true);

    this.player.message("§cХарактеристики сброшены.");
}

//--------ХП---------
// Метод при котором меняется хп
CharacteristicsSystem.prototype.updateHP = function (full) {
    var newHP = this.calcMaxHP()
    this.player.setMaxHealth(newHP);

    //Срабатывает при обновления уровня
    if (full) {
        this.player.setHealth(newHP);
    }
};

//Метод формулы для хп
CharacteristicsSystem.prototype.calcMaxHP = function () {
    return Math.round(
        this._baseHP + (3 * this.lvl) + (5.5 * this.characteristics.survivability)
    )
}

// ____________________СИСТЕМА ЭНЕРГИИ__________________________

function BloodEnergySystem(player, api) {
    CharacteristicsSystem.call(this, player, api);
    this.energy = this.nbt.has("Energy") ? this.nbt.getInteger("Energy") : 10;
    this.maxEnergy = this.nbt.has("MaxEnergy") ? this.nbt.getInteger("MaxEnergy") : 10;

    this.baseEnergy = 10;
    this.energyRegen = 1;
    this.regenCooldown = 4;
}

BloodEnergySystem.prototype = Object.create(CharacteristicsSystem.prototype);
BloodEnergySystem.prototype.constructor = BloodEnergySystem;

BloodEnergySystem.prototype.energyRegeneration = function () {
    if (this.energy < this.maxEnergy) {
        this.energy += this.energyRegen;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        this.updateOverlay("energychange", this.energy);
    }
}


// Использование энергии
BloodEnergySystem.prototype.energyCast = function (count) {
    if (this.energy > 0) {
        this.energy -= count;
        this.updateOverlay("energychange", this.energy);
        return true;
    } else {
        this.player.message("Вы не можете использовать это заклинания");
        return false;
    }
}

// Обновления максмальной энергии
BloodEnergySystem.prototype.energyUpdate = function (full) {
    this.maxEnergy = this.calcMaxEnergy();
    this.updateOverlay("maxenergychange", this.maxEnergy);

    //Срабатывает при обновления уровня
    if (full) {
        this.energy = this.maxEnergy;
        this.updateOverlay("energychange", this.energy);
    }

}

//Формула для энергии
BloodEnergySystem.prototype.calcMaxEnergy = function () {
    return Math.round(
        this.baseEnergy + (2 * this.lvl) + (2.5 * this.characteristics.bloodthirstiness)
    );
}

//________________БОЕВКА И ИСПОЛЬЗОВАНИЯ ОРУЖИЯ_________________________

function СombatForWeapon(player, api) {
    BloodEnergySystem.call(this, player, api);
    this.usedItem = false;
    this._baseDamage = 1;
}
СombatForWeapon.prototype = Object.create(BloodEnergySystem.prototype);
СombatForWeapon.prototype.constructor = СombatForWeapon;

//Метод проверяющий есть ли у игрока оружия или соотвествует характеристики для использования
СombatForWeapon.prototype.canUseWeaponAttack = function (event) {
    if (this.player.getGamemode() === 2) {
        if (!this.usedItem || this.usedItem.getString("weaponRange") !== "melee") {
            showActionBar("У вас в руках нету оружия", "red", this.api, this.player)
            event.setCanceled(true)
            return false
        }
        if (this.usedItem.getString("weaponRange") === "melee" &&
            (this.characteristics.strength < this.usedItem.getInteger("reqStrength")
                || this.characteristics.agility < this.usedItem.getInteger("reqAgility"))) {
            showActionBar("Вы не можете использовать, это оружия", "red", this.api, this.player)
            event.setCanceled(true)
            return false
        }
    }
    return true;
}

//Метод при не хватке характерстиков останавливает игрока
СombatForWeapon.prototype.tickMainHandWeapon = function () {
    this.usedItem = this.player.getMainhandItem().getNbt();
    if (this.usedItem && this.usedItem.getString("weaponRange") === "melee") {
        if (this.characteristics.strength < this.usedItem.getInteger("reqStrength")
            || this.characteristics.agility < this.usedItem.getInteger("reqAgility")) {
            this.player.addPotionEffect(2, 1, 10, false);
            this.player.addPotionEffect(33, 1, 0, false);
            return
        }
    }
}

//Метод для нанесения урона
СombatForWeapon.prototype.dealDamage = function (event) {
    var mainCharacteristics = 0;
    if (this.usedItem.getString("mainCharacteristics") === "strength") mainCharacteristics = this.characteristics.strength;
    if (this.usedItem.getString("mainCharacteristics") === "agility") mainCharacteristics = this.characteristics.agility;
    var dmg = calcDamage(this._baseDamage, mainCharacteristics, this.usedItem.getInteger("damage"));
    this.player.message(dmg + " | " + this.usedItem.getString("mainCharacteristics"))
    event.target.addPotionEffect(19, 5, 1, true)
    event.damage = dmg
}

//________________БРОНЯ И ИСПОЛЬЗОВАНИЯ_________________________

function ArmorSystem(player, api) {
    СombatForWeapon.call(this, player, api);
    this.resistanceName = ["chopping", "crushing", "piercing", "elemental", "magical"]
    this.incomingDamageType = this.tempPlayer.get("typeDamage")

    this.resistance = {
        chopping: 0,
        crushing: 0,
        piercing: 0,
        elemental: 0,
        magical: 0,
    }
}

ArmorSystem.prototype = Object.create(СombatForWeapon.prototype);
ArmorSystem.prototype.constructor = ArmorSystem;

ArmorSystem.prototype.messageResistance = function () {
    this.player.message(
        "\n" + this.resistance.chopping + "\n"
        + this.resistance.crushing + "\n"
        + this.resistance.piercing + "\n"
        + this.resistance.elemental + "\n"
        + this.resistance.magical + "\n"
    )
}

//Проверка одетой брони
ArmorSystem.prototype.checkArmors = function () {
    for (var j = 0; j < this.resistanceName.length; j++) {
        this.resistance[this.resistanceName[j]] = 0;
    }

    for (var i = 0; i < 4; i++) {
        var item = this.player.getArmor(i);

        if (!item) continue; // слот пуст

        var nbt = item.getNbt();
        for (var j = 0; j < this.resistanceName.length; j++) {
            var key = this.resistanceName[j];
            if (nbt.has(key)) {
                this.resistance[key] += nbt.getInteger(key);
            }
        }
    }
}

//Метод при не хватке характерстиков (брони) останавливает игрока
ArmorSystem.prototype.tickArmorReq = function () {
    for (var i = 0; i < 4; i++) {
        var item = this.player.getArmor(i);
        if (!item) continue;

        var nbt = item.getNbt();

        // Проверяем, есть ли требования к характеристикам
        if (nbt.has("reqStrength") || nbt.has("reqAgility")) {
            var reqStr = nbt.has("reqStrength") ? nbt.getInteger("reqStrength") : 0;
            var reqAgi = nbt.has("reqAgility") ? nbt.getInteger("reqAgility") : 0;

            if (this.characteristics.strength < reqStr || this.characteristics.agility < reqAgi) {
                this.player.setArmor(i, null);
                this.player.giveItem(item);
                showActionBar("Вы не можете использовать, эту броню", "red", this.api, this.player)
            }
        }
    }
}


//Получения урона
ArmorSystem.prototype.receivingDamage = function (event) {
    this.checkArmors();
    this.messageResistance();

    var damageType = this.tempPlayer.has("damageType") ? this.tempPlayer.get("damageType") : "none";
    var damage = event.damage;
    var finalDamage = this.calcIncomingDamage(damage, damageType);

    if (event.damageSource.getType() != "generic") return;

    event.damage = finalDamage;
    this.tempPlayer.remove("damageType");
}

//Калькулятор урона с учитыванием брони
ArmorSystem.prototype.calcIncomingDamage = function (damage, damageType) {
    var armorValue = this.resistance[damageType] || 0;
    var reduced = damage - (armorValue * 0.5);
    return Math.max(1, Math.floor(reduced));
}


//________________КЛАСС ДЛЯ ПРОКАЧКИ_________________________

function CharacterUpgrade(player, api) {
    ArmorSystem.call(this, player, api);
}
CharacterUpgrade.prototype = Object.create(ArmorSystem.prototype);
CharacterUpgrade.prototype.constructor = CharacterUpgrade;

//Подкапотом_______________________
// Прокачка характеристик | 2
var statName = ["strength", "agility", "bloodthirstiness", "survivability"];

CharacterUpgrade.prototype.upgradeStat = function (statName, statIndex, buttonId) {
    var cost = this.getCaclPoint(statName);
    var requiredLevel = this.getRequiredLevel(statName);
    var valuesCharacter = Object.keys(this.getValuesCharacter())

    if (this.lvl < requiredLevel) {
        this.player.message("§cДля улучшения " + valuesCharacter[statIndex + 5] + " нужен уровень персонажа не ниже " + requiredLevel);
        return false;
    }
    if (this.points < cost) {
        this.player.message("§cНедостаточно очков (нужно " + cost + ")");
        return false;
    }

    this.points -= cost;
    this.characteristics[statName]++;
    if (statName == "survivability") this.updateHP()
    if (statName == "bloodthirstiness") this.energyUpdate();
    this.save();
    this.player.message("§a" + valuesCharacter[statIndex + 5] + " прокачан! Потрачено очков: " + cost);
    return true;

};

//Gui_______________________
//Показывает гуи с прокачкой
CharacterUpgrade.prototype.showGuiPlayer = function (key) {
    if (key === 88) {
        var valuesCharacter = this.getValuesCharacter()
        var gui = this.api.createCustomGui(1, 200, 140, false);
        var heightButtonAndLabel = 10
        var idEnergy = 20;
        var idLabelCharacter = 0 //[1,2,3,4,5,6,7,8,9]
        var idButtonCharacter = 9 //[9,10,11,12]
        var idLabelInfo = 13 // [13,14,15,16]

        gui.addLabel(idEnergy, "Энергия" + ": " + this.energy, 10, 0, 0, 0);
        gui.addLabel(21, "Макс энергия: " + this.maxEnergy, 10, -5, 0, 0)

        for (var name in valuesCharacter) {
            if (valuesCharacter.hasOwnProperty(name)) {
                if (idLabelCharacter >= 5) {
                    var cost = this.getCaclPoint(statName[idLabelCharacter - 5])
                    var lvlCost = this.getRequiredLevel(statName[idLabelCharacter - 5])
                    gui.addButton(idButtonCharacter, "Прокачать", 120, heightButtonAndLabel - 5, 65, 18)
                    gui.addLabel(idLabelInfo, "§bТребуемое количество кровавых эссенций: " + cost + " |Требуемый уровень: " + lvlCost, 220, heightButtonAndLabel, 0, 0);
                    idButtonCharacter++
                    idLabelInfo++
                }
                gui.addLabel(idLabelCharacter, name + ": " + valuesCharacter[name], 10, heightButtonAndLabel, 0, 0);
                idLabelCharacter++;
                heightButtonAndLabel += 15;
            }
        }
        this.player.showCustomGui(gui);
    }
}
//Прокачка через кнопки
CharacterUpgrade.prototype.upgradeStatForButton = function (buttonId) {
    var statIndex = buttonId - 9;
    if (buttonId >= 9 && buttonId <= 12) {
        if (this.upgradeStat(statName[statIndex], statIndex)) {
            //keyPressed({ player: this.player, key: 88, API: this.api });
            this.showGuiPlayer(88);
        }
    }
}

function init(e) {
    var player = e.player;
    rpgPlayer = new CharacterUpgrade(player, e.API); //getRPGPlayer(player, e.API);
    rpgPlayer.updateHP(false);
    rpgPlayer.checkArmors();
    player.getTimers().forceStart(10, rpgPlayer.regenCooldown * 20, true);
}

function tick(e) {
    rpgPlayer.syncExp();
    rpgPlayer.tickMainHandWeapon();
    rpgPlayer.tickArmorReq();
}
//Ивент таймер
function timer(e) {
    if (e.id === 10) {
        rpgPlayer.energyRegeneration();
    }
}

//Ивент связанной с атакой
function attack(e) {
    rpgPlayer.canUseWeaponAttack(e)
}
function damagedEntity(e) {
    if (rpgPlayer.canUseWeaponAttack())
        rpgPlayer.dealDamage(e)
}

//Ивент связанный с броней
function damaged(e) {
    rpgPlayer.receivingDamage(e)
}

//Ивент для сохранения
function logout(e) {
    rpgPlayer.save()
}

function died(e) {
    rpgPlayer.diedPlayer();
}

function customGuiButton(e) {
    rpgPlayer.upgradeStatForButton(e.buttonId)
}

function keyPressed(e) {
    rpgPlayer.showGuiPlayer(e.key)
    if (e.key == 90) {
        rpgPlayer.reset()
    }
}

function calcDamage(damage, ability, weaponDmg) {
    if (weaponDmg == null) weaponDmg = 0;
    return Math.round(
        damage + ability * 1.5 + Math.pow(Math.max(0, ability - 10), 2) * 0.05 + weaponDmg
    );
}
