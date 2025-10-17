var Thread = Java.type("java.lang.Thread");
var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
var systemAnimation;

function init(e) {
    try {
        systemAnimation = animHandler(e.npc, config(e.npc))
        if (systemAnimation && systemAnimation.init) systemAnimation.init(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function meleeAttack(e) {
    try {
        if (systemAnimation && systemAnimation.meleeAttack) systemAnimation.meleeAttack(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function interact(e) {
    //systemAnimation.startAttackAnimation(systemAnimation.config.attacks[2])
    //systemAnimation.attackRange(e.player)
}

function damaged(e) {
    try {
        if (systemAnimation && systemAnimation.damaged) systemAnimation.damaged(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function tick(e) {
    try {
        if (systemAnimation && systemAnimation.tick) systemAnimation.tick(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function target(e) {
    try {
        if (systemAnimation && systemAnimation.target) systemAnimation.target(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function collide(e) {
    try {
        if (systemAnimation && systemAnimation.collide) systemAnimation.collide(e)
    } catch (err) { e.npc.say("Ошибка! " + err) }
}

function config(npc, context) {
    var othF = otherFunc()
    return {
        distanceAttack: 5.5, // дистанция атаки игрока
        typeWalk: "walk", // название анимации бега за игроком
        otherFunc: (othF || {}), // не трогать
        timeDelayOfAttack: 300, // время задержки перед началом каждого удара. Регулировать по необходимости.
        changeStats: function (npc) {
            npc.setName("Ривер"); // имя нпс
            npc.ai.setWalkingSpeed(4) // стандартная скорость нпс
            npc.display.setVisible(0) // видимость (0 - включено, 1 - невидим, 2 - полувидимый)
        },
        addFunc: {
            // не трогать особо. Добавления ко всем функциям. Если вернете true = то функция вернется и дальше не пойдёт.
            // пример - init: function(this, e){}
        },
        attacks: [
            {
                animation: [["punch_1", 0]], // принцип - [[имя_анимации, длительность]] - после длительности вызывается следующая анимация, если есть
                // к примеру [[атака1, 1000], [атака2, 0]] - то есть, вызывается атака1, через 1000 милисекунд вызывается атака 2.
                chance: 50, // Шанс на то, что конкретно эта атака будет вызвана. В сумме со всех атак это должно составлять 100.
                speed: 2, // Скорость нпс при атаке
                hitList: [
                    [750, { dmg: 2, range: 6.4, blockDef: 15, agree: 210, motion: [0.7, 0.8], sound: ["customnpcs:misc.old_explode", 15, 2], func: function (npc, target, main) { } }],
                    [700]
                    // принцип - [Задержка, {Объект атаки (dmg: урон, range: дальность, blockDef: на сколько пробивает щит, agree: угол атаки, motion: [(откидывание) горизонтальное, вертикальное], sound[soundname, volume, pitch], доп функция)}]
                ],
                func: othF.attackOne //дополнительная функция атаки
            },

            {
                animation: [["punch_2", 0]], // принцип - [[имя_анимации, длительность]] - после длительности вызывается следующая анимация, если есть
                // к примеру [[атака1, 1000], [атака2, 0]] - то есть, вызывается атака1, через 1000 милисекунд вызывается атака 2.
                chance: 50, // Шанс на то, что конкретно эта атака будет вызвана. В сумме со всех атак это должно составлять 100.
                speed: 1, // Скорость нпс при атаке
                hitList: [
                    [750, { dmg: 2, range: 6.1, blockDef: 20, agree: 360, motion: [0.65, 0.7], sound: ["customnpcs:misc.swosh", 5, 0.8], func: function (npc, target, main) { } }],
                    [700]
                    // принцип - [Задержка, {Объект атаки (dmg: урон, range: дальность, blockDef: на сколько пробивает щит, agree: угол атаки, motion: [(откидывание) горизонтальное, вертикальное], sound[soundname, volume, pitch], доп функция)}]
                ],
                func: othF.attackTwo //дополнительная функция атаки.
            },

        ],
        rangeStats: {
            distanceRangeAttack: 12, // дистанция дальней атаки. Если значение -1 - то не проигрывает.
            cooldownRangeAttack: 10, // кулдаун дальней атаки.
        },
        rangeAttack: [ // конфиг дальней атаки
            {
                //лишь пример. Шансы так же считаются, как в ближних атаках.
                /*
                animation: [["cast", 0]],
                chance: 100,
                func: function (rpg, object) {
                    try {
                        var ShamThread = Java.extend(Thread, {
                            run: function () {
                                try {
                                    
                                } catch (err) { rpg.npc.say(err) }
                            }
                        }); var S = new ShamThread(); rpg.otherThread = S; S.start();
                    } catch (err) { rpg.npc.say("Ошибка в rangeaTTACK! " + err) }
                },
                speed: 0
                actions: [2010],
                item: ["minecraft:snow_block"],
                accurate: [10],
                count: [5]*/
            }
        ],
        targetEntity: [/*"rage", 2000, function (obj) { }*/], // Какая анимация вызывается  и сколько длится при агре
        targetHP: [], // Фазы. Формат - [[75, othF.playStan], [40, othF.playStan]]
        death: { animation: "death", timeDeath: 3000, func: function (rpg) { rpg.npc.world.playSoundAt(rpg.npc.pos, "", 10, 1) } } // смерть, аимация, длительность, доп функция, если нужна
    }
}

function otherFunc() {
    return {

        playStan: function (npc, obj) {

        },

        attackOne: function (npc, obj) {
            Thread.sleep(1200)
            npc.say("Атака 1")
        },

        attackTwo: function (npc, obj) {
            Thread.sleep(1000)
            npc.say("Атака 2")
        }
    }
}

function animHandler(npc, config) {
    return {
        npc: npc,
        attackThread: null,
        otherThread: null,
        api: null,
        death: false,
        targetHP: null,
        attackThreadAbility: null,
        animationThread: null,
        config: config,
        lastAttack: null,

        init: function (e) {
            var npc = e.npc;
            npc.timers.forceStart(14132, 10, false)
            this.api = e.API;
            if (this.config.addFunc && this.config.addFunc.init) { if (this.config.addFunc.init(this, e)) return; }
            this.changeStats()
            this.death = !npc.isAlive()
            this.reloadThreeds()
        },

        reloadThreeds: function () {
            if (this.attackThread && this.attackThread.isAlive()) this.attackThread.interrupt();
            if (this.otherThread && this.otherThread.isAlive()) this.otherThread.interrupt();
            if (this.animationThread && this.animationThread.isAlive()) this.animationThread.interrupt();
            if (this.attackThreadAbility && this.attackThreadAbility.isAlive()) this.attackThreadAbility.interrupt()
            if (this.targetHP && this.targetHP.isAlive()) this.targetHP.interrupt()
        },

        changeStats: function () {
            this.config.changeStats(this.npc)
        },

        tick: function (e) {
            if (this.config.addFunc && this.config.addFunc.meleeAttack) { if (this.config.addFunc.tick(this, e)) return; }
            this.checkRangeAttack()
        },

        target: function (e) {
            var object = this.config.targetEntity
            if (!object || (this.npc.health >= this.npc.getMaxHealth() - 1)) return;
            if (this.config.addFunc && this.config.addFunc.target) { if (this.config.addFunc.target(this, e)) return; }
            this.animated(object[0]);
            this.targetFunc(object[1])
            if (object[2] && typeof object[2] == "function") object[2](this)
        },

        targetFunc: function (time) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {

                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка! " + err); }
                }
            }); this.attackThread = new ShamThread(); this.attackThread.start();
        },

        meleeAttack: function (e) {
            e.setCanceled(true);
            if (this.distanceEntity(this.npc, e.target) > this.config.distanceAttack) { return; }
            this.lastAttack = new Date().getTime()
            e.npc.clearNavigation()
            if (this.death || this.attackThread && this.attackThread.isAlive() || this.otherThread && this.otherThread.isAlive() || this.targetHP && this.targetHP.isAlive() || this.attackThreadAbility && this.attackThreadAbility.isAlive()) { return; }
            this.startMeleeAttack(e)
        },

        startMeleeAttack: function (e) {
            var animObject = this.checkAnimtion()
            if (!animObject) return;
            if (this.config.addFunc && this.config.addFunc.meleeAttack) { if (this.config.addFunc.meleeAttack(this, e)) return; }
            this.startAttackAnimation(animObject)
        },

        startAttackAnimation: function (object) {
            if (this.attackThread && this.attackThread.isAlive()) this.attackThread.interrupt()
            if (this.attackThreadAbility && this.attackThreadAbility.isAlive()) this.attackThreadAbility.interrupt()
            if (!object) return
            if (object.func) this.startAbilityhread(object.func, npc, this)
            this.startAnimations(object.animation, this)
            this.runAttack(this.npc, object.hitList, [object.speed, this.normalSpeed], this)
        },

        projImpact: function (e) {

        },

        damaged: function (e) {
            var npc = e.npc;
            if (!npc.getAttackTarget() && e.source) npc.setAttackTarget(e.source)
            if (this.config.addFunc && this.config.addFunc.damaged) { if (this.config.addFunc.damaged(this, e)) return; }
            if (this.death) { e.setCanceled(true); return; }
            if (this.config.death && this.checkDeath(e)) {
                if (this.attackThread && this.attackThread.isAlive()) this.attackThread.interrupt();
                if (this.otherThread && this.otherThread.isAlive()) this.otherThread.interrupt();
                if (this.animationThread && this.animationThread.isAlive()) this.animationThread.interrupt();
                if (this.attackThreadAbility && this.attackThreadAbility.isAlive()) this.attackThreadAbility.interrupt()
                if (this.targetHP && this.targetHP.isAlive()) this.targetHP.interrupt()
                e.setCanceled(true);
                this.deathFunc(e, this);
                return;
            };
            if (this.config.targetHP.length && (((this.npc.getHealth() - e.damage) / this.npc.getMaxHealth()) * 100 < this.config.targetHP[0][0])) {
                if (this.otherThread && this.otherThread.isAlive()) this.otherThread.interrupt();
                if (this.targetHP && this.targetHP.isAlive()) return
                if (this.attackThread && this.attackThread.isAlive()) this.attackThread.interrupt();
                if (this.attackThreadAbility && this.attackThreadAbility.isAlive()) this.attackThreadAbility.interrupt()
                if (this.animationThread && this.animationThread.isAlive()) this.animationThread.interrupt();
                this.startTargetHPThread(this.config.targetHP[0][1], this.npc, this);
                this.config.targetHP.shift();
            };
        },

        collide: function (e) {
            var entity = e.entity;
            if (this.config.addFunc && this.config.addFunc.damaged) { if (this.config.addFunc.damaged(this, e)) return; }
        },

        checkRangeAttack: function () {
            if (this.config.rangeStats.distanceRangeAttack === -1 || !this.npc.getAttackTarget() || this.death || this.attackThread && this.attackThread.isAlive() || this.otherThread && this.otherThread.isAlive() || this.targetHP && this.targetHP.isAlive() || this.attackThreadAbility && this.attackThreadAbility.isAlive()) { return; }
            var cd = this.npc.getTempdata().get("cdRange")
            var data = new Date().getTime()
            if (cd > data) return;
            var target = this.npc.getAttackTarget()
            var dist = distance(target.x, target.y, target.z, this.npc.x, this.npc.y, this.npc.z)
            if (Math.abs(dist[3]) < this.config.rangeStats.distanceRangeAttack) return;
            this.npc.getTempdata().put("cdRange", (data + (this.config.rangeStats.cooldownRangeAttack * 1000)))
            this.attackRange(target)
        },

        distanceEntity: function (entity1, entity2) {
            var dx = entity2.getX() - entity1.getX();
            var dy = entity2.getY() - entity1.getY();
            var dz = entity2.getZ() - entity1.getZ();
            var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            return distance;
        },

        attackRange: function (target) {
            var obj = this.getAttackRange()
            if (!obj) return;
            this.startAnimations(obj.animation, this)
            if (obj.actions && obj.actions.length) this.SHOOT(this.npc, obj, target, this)
            if (obj.func) obj.func(this, obj[1])
        },

        SHOOT: function (npc, info, target, obj) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        npc.ai.setWalkingSpeed(info.speed)
                        for (var key in info.actions) {
                            Thread.sleep(info.actions[key])
                            var item = npc.world.createItem(info.item[key], 1)
                            for (var d = 0; d < info.count[key]; d++) {
                                var shot = npc.shootItem(target, item, info.accurate[key])
                            }
                        }
                        obj.changeStats()
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка! " + err); }
                }
            }); this.attackThread = new ShamThread(); this.attackThread.start();
        },

        getAttackRange: function () {
            var obj = this.config.rangeAttack
            var chance = 0;
            for (var key in obj) {
                chance += obj[key].chance;
                if (Math.random() < (chance / 100)) {
                    return obj[key]
                }
            }
        },

        checkDeath: function (event) {
            return (this.npc.health - event.damage <= (this.npc.getMaxHealth() / 100))
        },

        checkAnimtion: function () {
            var config = this.config.attacks;
            var chance = 0;
            var npc = this.npc
            for (var key in config) {
                chance += config[key].chance
                if (Math.random() < chance / 100) {
                    return config[key];
                }
            }
        },

        startAnimations: function (obj, rpg) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        for (var key in obj) {
                            rpg.animated(obj[key][0])
                            Thread.sleep(obj[key][1])
                        }
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка! " + err); }
                }
            }); var S = new ShamThread(); this.animationThread = S; S.start();
        },

        animated: function (name) {
            var builder = this.api.createAnimBuilder()
            builder.playOnce(name)
            this.npc.syncAnimationsForAll(builder)
        },

        clearAnim: function () {
            if (this.otherThread && this.otherThread.isAlive() || this.targetHP && this.targetHP.isAlive()) { return; }
            if (this.lastAttack > (new Date().getTime() - 150)) {
                if (this.npc.timers.has(14132)) this.startMeleeAttack()
                return;
            }
            if (!this.npc.isNavigating()) return;
            var builder = this.api.createAnimBuilder()
            builder.playOnce(this.config.typeWalk || "run")
            this.npc.syncAnimationsForAll(builder)
        },

        runAttack: function (npc, attack, speed, obj) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        npc.ai.setWalkingSpeed(speed[0])
                        for (var key in attack) {
                            Thread.sleep(attack[key][0])
                            if (key == 0) Thread.sleep(obj.config.timeDelayOfAttack)
                            if (!attack[key][1]) continue;
                            checkDamage(npc, attack[key][1], obj)
                        }
                        obj.clearAnim()
                        obj.changeStats()
                    } catch (err) { if (err == "java.lang.InterruptedException: sleep interrupted") { print("Прерываю поток! ") } else { npc.say("Ошибка! " + err); } }
                }
            }); this.attackThread = new ShamThread(); this.attackThread.start();
        },

        deathFunc: function (e, obj) {
            var npc = e.npc;
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        npc.ai.setWalkingSpeed(0)
                        if (obj.config.death.func) obj.config.death.func(obj)
                        obj.death = true;
                        obj.animated(obj.config.death.animation);
                        Thread.sleep(obj.config.death.timeDeath || 1000)
                        npc.display.setVisible(1)
                        npc.world.spawnParticle("cloud", npc.x, npc.y, npc.z, 1.3, 1.1, 1.3, 0, 75)
                        Thread.sleep(1000)
                        npc.setHealth(0)
                        Thread.sleep(1000)
                        obj.changeStats()
                        npc.display.setVisible(0)
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка! " + err); }
                }
            }); var S = new ShamThread(); S.start();
        },

        startOtherThread: function (func, npc, obj) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        func(npc, obj);
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка в другом потоке! " + err); }
                }
            });
            var S = new ShamThread();
            this.otherThread = S;
            S.start();
        },

        startTargetHPThread: function (func, npc, obj, key) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        func(npc, obj, key);
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка в другом потоке! " + err); }
                }
            });
            var S = new ShamThread();
            this.targetHP = S;
            S.start();
        },

        startAbilityhread: function (func, npc, obj, key) {
            var ShamThread = Java.extend(Thread, {
                run: function () {
                    try {
                        func(npc, obj, key);
                    } catch (err) { if (err != "java.lang.InterruptedException: sleep interrupted") npc.say("Ошибка в другом потоке! " + err); }
                }
            });
            var S = new ShamThread();
            this.attackThreadAbility = S;
            S.start();
        }
    }
}

function checkDamage(npc, obj, main) {
    if (obj.sound) npc.world.playSoundAt(npc.pos, obj.sound[0], obj.sound[1], obj.sound[2])
    var entities = npc.world.getNearbyEntities(npc.pos, Math.ceil(obj.range), 5)
    for (var key in entities) {
        var entity = entities[key]
        if (entity.getType() === 1 && npc.getFaction().playerStatus(entity) === 1) { continue }
        if (entity.getType() === 2 && !npc.getFaction().hostileToNpc(entity)) { continue }
        if (entity == npc) continue
        if (CheckFOV(npc, entity, obj.agree, obj.dopagree) && (distance(npc.x, npc.y, entity.z, entity.x, entity.y, entity.z)[3] <= obj.range)) {
            if (obj.dmg) damagef(entity, obj.dmg, npc, obj.motion, main, obj.func, obj.blockDef);
        }
    }
}

function damagef(entity, damage, source, motion, main, func, blockCoef) {
    if (!entity) return;
    if (!blockCoef) blockCoef = 0;

    if (entity.timers) {
        if (entity.timers.has(1534)) return;
        entity.timers.forceStart(1534, 5, false);
    }

    if (checkFr(entity, source)) return;

    if (func) func(source, entity, main);

    if (source && !entity.getAttackTarget()) {
        entity.setAttackTarget(source);
    }

    if (entity.getType() === 1 && entity.getMCEntity().func_184585_cz()) {
        handleShieldBlock(entity, blockCoef, motion, damage, source);
    } else {
        applyDamage(entity, damage, source);
    }

    if (motion) {
        applyMotion(entity, source, motion);
    }
}

function handleShieldBlock(entity, blockCoef, motion, damage, source) {
    entity.world.playSoundAt(entity.getPos(), "item.shield.block", 10, 1);
    updateItemDamage(entity.getOffhandItem());
    updateItemDamage(entity.getMainhandItem());

    if (motion && (motion[0] || motion[1])) {
        var d = FrontVectors(source, GetPlayerRotation(source, entity), 0, motion[0], 0);
        entity.setMotionX(d[0] / 1.5);
        entity.setMotionY(motion[1] / 1.5);
        entity.setMotionZ(d[2] / 1.5);
    }

    entity.damage(damage * (blockCoef / 100));
}

function updateItemDamage(item) {
    if (item && item.isDamageable()) {
        item.setDamage(item.getDamage() + 10);
        if (item.getDamage() > item.getMCItemStack().func_77958_k()) {
            item.setStackSize(item.getStackSize() - 1);
        }
    }
}

function applyDamage(entity, damage, source) {
    var armor = entity.getMCEntity().func_70658_aO();
    var damagepl = (damage / 100) * (100 - (armor * 3));
    entity.damage(damagepl);

    if (entity.getType() === 1) {
        for (var i = 0; i < 4; i++) {
            var itemArmor = entity.getArmor(i);
            itemArmor.damageItem(1, source);
        }
    }
}

function applyMotion(entity, source, motion) {
    if (entity.getType() === 2) {
        var resistance = 2 - entity.stats.getResistance(3);
        motion[0] *= resistance;
        motion[1] *= Math.min(resistance, 1.3);
    }

    if (motion[0] || motion[1]) {
        var d = FrontVectors(source, GetPlayerRotation(source, entity), 0, motion[0], 0);
        entity.setMotionX(d[0]);
        entity.setMotionY(motion[1]);
        entity.setMotionZ(d[2]);
    }
}


function checkFr(entity, source) {
    if (entity.getType() === 1 && (source.getFaction().playerStatus(entity) === 1 || entity.getGamemode() === 1)) { return true }
    if (entity.getType() === 2 && !source.getFaction().hostileToNpc(entity)) { return true }
}

function GetPlayerRotation(npc, player) {
    var dx = npc.getX() - player.getX();
    var dz = player.getZ() - npc.getZ();
    if (dz >= 0) {
        var angle = (Math.atan(dx / dz) * 180 / Math.PI);
        if (angle < 0) {
            angle = 360 + angle;
        }
    }
    if (dz < 0) {
        dz = -dz;
        var angle = 180 - (Math.atan(dx / dz) * 180 / Math.PI);
    }
    return angle;
}

function FrontVectors(entity, dr, dp, distance, mode) {
    if (mode == 1) { var angle = dr + entity.getRotation(); var pitch = (-entity.getPitch() + dp) * Math.PI / 180 }
    if (mode == 0) { var angle = dr; var pitch = (dp) * Math.PI / 180 }
    var dx = -Math.sin(angle * Math.PI / 180) * (distance * Math.cos(pitch))
    var dy = Math.sin(pitch) * distance
    var dz = Math.cos(angle * Math.PI / 180) * (distance * Math.cos(pitch))
    return [dx, dy, dz]
}

function CheckFOV(seer, seen, FOV, dopAgree) {
    var P = (seer.getRotation() + (dopAgree || 0))
    if (P < 0) P = P + 360
    var rot = Math.abs(GetPlayerRotation(seer, seen) - P)
    if (rot > 180) rot = Math.abs(rot - 360)
    if (rot < FOV / 2) return true;
    else { return false; }
}

function distance(x1, y1, z1, x2, y2, z2) {
    var distanciaX = x2 - x1;
    var distanciaY = y2 - y1;
    var distanciaZ = z2 - z1;
    var distanciaTotal = Math.sqrt(Math.pow(distanciaX, 2) + Math.pow(distanciaY, 2) + Math.pow(distanciaZ, 2));
    var distancia = [distanciaX, distanciaY, distanciaZ, distanciaTotal]
    return distancia;
}