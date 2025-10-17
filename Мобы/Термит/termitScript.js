var npcData;
var api = Java.type("noppes.npcs.api.NpcAPI").Instance();

//создает объект для нпс
function createNpcData(npc) {
    return {
        npc: npc,
        target: null,
        attackType: -1,
        deathType: -1,
        exp: 100,
        //поведения нпс(глобальные переменные)
        behavior: {
            idle: true,
            onAttack: false,
            onDeath: false,
        },
        //Внутренные данные
        combat: {
            damage: [3, 4.5],
            range: 3,
            damageCooldown: [0.65, 0.8],
            powerKnockback: 1,
            powerAttract: 1.5,
            chanceAttack: 35,
            blockDef: 30,
            //Сбывания щита
            handleShieldBlock: function (mcEntity) {
                if (!mcEntity) return false;

                var isBlocking = mcEntity.func_184585_cz();
                if (!isBlocking) return false;

                var activeItem = mcEntity.func_184607_cu();
                if (activeItem == undefined) return false;

                var chance = this.blockDef / 100;
                //Если щит сломался
                if (Math.random() < chance) {
                    mcEntity.func_184602_cy();// Прекращаем блокировку
                    var itemUseManager = mcEntity.func_184811_cZ();
                    itemUseManager.func_185145_a(activeItem.func_77973_b(), 60); // Ставим кулдаун щита 3 секунды (60 тиков)
                    npcData.sounds.playSound(npcData.npc, 'minecraft:item.shield.break');
                    return true;
                } //Если щит несломался
                else {
                    npcData.sounds.playSound(npcData.npc, 'minecraft:item.shield.block');
                    return true;
                }
            },
            //Отталкивания 
            applyKnockback: function (data) {
                var target = data.target;
                var npc = data.npc;

                if (target != null && npc != null) {
                    var dx = target.x - npc.x;
                    var dy = target.y - npc.y;
                    var dz = target.z - npc.z;
                    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist != 0) {
                        target.motionX = (dx / dist) * this.powerKnockback;
                        target.motionY = (dy / dist) * this.powerKnockback;
                        target.motionZ = (dz / dist) * this.powerKnockback;
                    }
                }
            },
            //Притягивания
            applyAttract: function (data) {
                var target = data.target;
                var npc = data.npc;

                if (target != null && npc != null) {
                    var dx = npc.x - target.x
                    var dy = npc.y - target.y
                    var dz = npc.z - target.z
                    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist != 0) {
                        target.motionX = (dx / dist) * this.powerAttract
                        target.motionY = (dy / dist) * this.powerAttract
                        target.motionZ = (dz / dist) * this.powerAttract
                    }
                }
            },
        },
        stats: {
            //Рандомная хп
            maxHealthRange: [12, 18],
            getRandomHealth: function () {
                var npc = this.npc
                if (npc.world.storeddata.get("npcsHealthChanged") === 1) return;
                var range = this.stats.maxHealthRange;
                var randomHealth = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

                npc.setMaxHealth(randomHealth);
                npc.setHealth(randomHealth);
                //npc.world.storeddata.put("healthChanged", 1)
            },
        },
        death: {
            deathTime: [1.6, 2.1],
            deathEnd: false,
            //смерть
            start: function (deathAnim) {
                this.behavior.onDeath = true;
                this.behavior.idle = false;
                this.behavior.onAttack = false;

                var cooldown = this.death.deathTime[this.deathType];

                this.npc.ai.setWalkingSpeed(0);
                this.sounds.playSound(npcData.npc, npcData.sounds.death);
                this.playAnimation(deathAnim);
                this.npc.getTimers().forceStart(20, cooldown * 20, false);
            },
            end: function () {
                var npc = this.npc
                npc.world.spawnParticle("soul", npc.x, npc.y + 0.6, npc.z, 0, 0, 0, 0.1, 90)
                npc.display.setVisible(1);
                npc.display.setHitboxState(1);
                npc.updateClient();
                npc.damage(9999);
            },
        },
        //Внешние данные
        textures: {
            list: [
                "geckolib3:textures/model/entity/termit/termit.png",
                "geckolib3:textures/model/entity/termit/termit1.png",
                "geckolib3:textures/model/entity/termit/termit2.png"
            ],
            //Рандомная текстура
            getRandomTexture: function () {
                var npc = this.npc;
                if (npc.world.storeddata.get("npcsTextureChanged") === 1) return;
                var textures = this.textures.list;
                npc.display.setSkinTexture(textures[Math.floor(Math.random() * textures.length)]);
            },
        },
        sounds: {
            //Проигрывания звука
            attack: "minecraft:entity.spider.hurt",
            damaged: "customnpcs:termit_damaged",
            death: "customnpcs:termit_death",
            idle: "customnpcs:termit_idle",
            cooldownIdleDiapozon: [8, 12],
            playSound: function (npc, sound) {
                npc.world.playSoundAt(npc.pos, sound, 0.3, 0.8 + Math.random() * 0.2)
            },
        },
        animations: {
            attack: ["animation.termit.hit1", "animation.termit.hit"],
            death: ["animation.termit.death", "animation.termit.death1"],
            //Анимация для атаки
            getAttackAnimation: function () {
                if (Math.random() <= (this.combat.chanceAttack / 100)) {
                    this.attackType = 1;
                    return this.animations.attack[1];
                } else {
                    this.attackType = 0;
                    return this.animations.attack[0];
                }
            },
            //Анимация для смерти
            getDeathAnimation: function () {
                var index = Math.floor(Math.random() * this.animations.death.length);
                this.deathType = index;
                return this.animations.death[index];
            }
        },
        //атака
        handleAttack: function () {
            var npc = this.npc;
            var target = this.target;
            if (!this.target) {
                this.behavior.onAttack = false;
                this.target = null;
                return;
            }
            var mcEntity = target.getMCEntity();
            var distance = npc.getPos().distanceTo(target.getPos());
            this.sounds.playSound(npc, this.sounds.attack);
            if (distance <= this.combat.range) {
                if (!this.combat.handleShieldBlock(mcEntity)) {
                    target.damage(this.combat.damage[this.attackType]);
                    (this.attackType == 1) ? this.combat.applyAttract(this) : this.combat.applyKnockback(this);
                }
            }
            this.attackType = -1;
            this.behavior.onAttack = false;
            this.target = null;
        },
        givePlayerXp: function (attacker) {
            if (attacker != null && attacker.getType() === 1) {
                attacker.getTempdata().put("giveXp", npcData.exp);
            }
        },
        //Проигрывания анимаций
        playAnimation: function (anim) {
            var builder = api.createAnimBuilder();
            builder.playOnce(anim).playOnce(anim);
            this.npc.syncAnimationsForAll(builder);
        },
    }
}

// Возвращает или создаёт объект npcData для этого NPC
function getNpcData(npc) {
    var tempData = npc.getTempdata()
    if (!tempData.has("npcData")) {
        tempData.put("npcData", createNpcData(npc))
    }
    return tempData.get("npcData");
}

// ====== Ивенты ======
function init(e) {
    npcData = getNpcData(e.npc)
    npcData.stats.getRandomHealth.call(npcData)
    npcData.textures.getRandomTexture.call(npcData)
}

function tick(e) {
    var timer = e.npc.getTimers()
    if (npcData.behavior.idle && !timer.has(10) && !npcData.behavior.onDeath) {
        var soundIdle = npcData.sounds.cooldownIdleDiapozon;
        var cooldownSound = Math.floor(Math.random() * (soundIdle[1] - soundIdle[0] + 1)) + soundIdle[0];
        timer.forceStart(10, cooldownSound * 20, false)
    }
}

function meleeAttack(e) {
    e.setCanceled(true);
    if (npcData.behavior.onAttack || npcData.behavior.onDeath) return;

    npcData = getNpcData(e.npc);
    npcData.behavior.onAttack = true;
    var animation = npcData.animations.getAttackAnimation.call(npcData)
    npcData.playAnimation(animation)
    npcData.target = e.target
    e.npc.getTimers().forceStart(0, 0, false)

}

function damaged(e) {
    npcData = getNpcData(e.npc)

    if (npcData.behavior.onDeath && e.damage < 9999) {
        e.setCanceled(true)
        return;
    }

    if (!npcData.behavior.onDeath) {
        npcData.sounds.playSound(e.npc, npcData.sounds.damaged)
    }

    if (e.damage >= e.npc.getHealth() && !npcData.behavior.onDeath && !npcData.deathEnd) {
        npcData.givePlayerXp(e.source);
        e.setCanceled(true)
        npcData.death.start.call(npcData, npcData.animations.getDeathAnimation.call(npcData))
    }
}

function died(e) {
    npcData = getNpcData(e.npc);
    npcData.behavior.onDeath = false;
    npcData.behavior.idle = true;
    npcData.death.deathEnd = false;
}

function target(e) {
    npcData.behavior.idle = false;
}
function targetLost(e) {
    npcData.behavior.idle = true;
}

function timer(e) {
    // таймер для звука
    if (e.id == 10 && npcData.behavior.idle) {
        npcData.sounds.playSound(e.npc, npcData.sounds.idle)
    }
    //таймер для атаки
    if (!npcData) return;

    if (e.id == 0) {
        var cooldown = npcData.combat.damageCooldown[npcData.attackType];
        e.npc.getTimers().forceStart(1, cooldown * 20, false)
    }
    if (e.id == 1) {
        npcData.handleAttack()
    }
    //Таймер для смерти
    if (e.id == 20) {
        npcData.deathEnd = true;
        npcData.death.end.call(npcData)
    }
}

