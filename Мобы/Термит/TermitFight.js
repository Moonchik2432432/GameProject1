var damageNpc = {
    defaultDamage: 3,
    strongDamage: 5.5,
    range: 2,
    damageTime: 13,
    strongDamageTime: 16,
    powerKnockback: 0.6,
    powerAttract: 0.8,
    animationHit: ["animation.termit.hit", "animation.termit.hit1"],
    attackSound: "minecraft:entity.spider.hurt"
}

var animationTermitDeath = [
    "animation.termit.death",
    "animation.termit.death1"
];

var skinTexture = [
    "geckolib3:textures/model/entity/termit/termit.png)",
    "geckolib3:textures/model/entity/termit/termit1.png)",
    "geckolib3:textures/model/entity/termit/termit2.png)"
];

var object;
var attacker;

function init(e) {
    var npc = e.npc;
    var npcDisplay = npc.display;

    var randomHp = Math.floor(Math.random() * (18 - 12 + 1)) + 12;
    var randomSkin = Math.floor(Math.random() * skinTexture.length);

    deathAnimation = false;
    npcDisplay.setVisible(0);
    npc.ai.setWalkingSpeed(5);
    npcDisplay.setSkinTexture(skinTexture[randomSkin]);
    npc.setMaxHealth(randomHp);
    npc.updateClient();
}

function meleeAttack(e) {
    var npc = e.npc;
    var npcTimer = npc.getTimers();
    var amimationAttack = damageNpc.animationHit;

    object = e.target;
    attacker = e.npc;

    randomAttack = Math.floor(Math.random() * amimationAttack.length);

    e.setCanceled(true);
    npcTimer.forceStart(100, 0, false)
}

function damaged(e) {
    var npc = e.npc;
    var npcWorld = npc.world;
    var npcDisplay = npc.display;
    var randomDied = Math.floor(Math.random() * animationTermitDeath.length);


    if (!deathAnimation) {
        npcWorld.playSoundAt(npc.pos, "customnpcs:termit_damaged", 0.4, 0.8 + Math.random() * 0.2)
    }

    if (deathAnimation && e.damage < 9999) {
        e.setCanceled(true)
        return;
    }
    if (e.damage >= npc.getHealth() && !deathAnimation) {
        e.setCanceled(true);
        npcWorld.playSoundAt(npc.pos, "customnpcs:termit_death", 0.5, 1)
        npc.ai.setWalkingSpeed(0);
        deathAnimation = true;
        playAnim(animationTermitDeath[randomDied], npc)
        threadrun(function () {
            if (randomDied === 0) {
                thread.sleep(1600);
            } else if (randomDied === 1) {
                thread.sleep(2100);
            }
            npcWorld.spawnParticle("soul", npc.x, npc.y + 0.6, npc.z, 0, 0, 0, 0.1, 90)
            npcDisplay.setVisible(1);
            npcDisplay.setHitboxState(1);
            npc.updateClient();
            npc.damage(9999);
        })
    }
}

var randomAttack;

function timer(e) {
    var id = e.id;
    var amimationAttack = damageNpc.animationHit;
    var npc = e.npc;
    var npcTimer = npc.getTimers();
    var npcWorld = npc.world;

    var attackIdFirst = 150;
    var attackIdSecond = 151;


    if (id == 100) {
        if (deathAnimation) {
            return;
        }
        playAnim(amimationAttack[randomAttack], npc)

        if (randomAttack === 0) {
            npcTimer.forceStart(attackIdFirst, damageNpc.strongDamageTime, false)
        } else if (randomAttack === 1) {
            npcTimer.forceStart(attackIdSecond, damageNpc.damageTime, false)
        }
    }
    if (id == attackIdFirst) {
        attack(damageNpc.strongDamage, damageNpc.range)
    } else if (id == attackIdSecond) {
        attack(damageNpc.defaultDamage, damageNpc.range)
    }

    function attack(damage, range) {
        var victim = npc.world.getNearbyEntities(npc.getPos(), range, null)
        for (var i = 0; i < victim.length; i++) {
            if (victim[i] != npc && victim[i].getName() != "Термит") {
                if (victim && deathAnimation == false && object) {
                    object.damage(damage);
                    if (randomAttack === 0) {
                        attractKnockback(damageNpc.powerAttract, true)
                        npcTimer.stop(attackIdFirst)
                    } else if (randomAttack === 1) {
                        attractKnockback(damageNpc.powerKnockback, false)
                        npcTimer.stop(attackIdSecond)
                    }
                }
            }
        }
        npcWorld.playSoundAt(npc.pos, damageNpc.attackSound, 0.5, 0.8 + Math.random() * 0.2)
    }

    function attractKnockback(power, bool) {
        if (object != null && attacker != null) {
            var dx;
            var dy;
            var dz;
            if (bool == true) {
                dx = attacker.x - object.x;
                dy = attacker.y - object.y;
                dz = attacker.z - object.z;
            } else if (bool == false) {
                dx = object.x - attacker.x;
                dy = object.y - attacker.y;
                dz = object.z - attacker.z;
            }

            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist != 0)
                object.motionX = (dx / dist) * power;
            object.motionY = (dy / dist) * power;
            object.motionZ = (dz / dist) * power;
        }
    }
}

var deathAnimation = false;

function playAnim(anim, npc) {
    var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
    var builder = api.createAnimBuilder();
    builder.playOnce(anim).playOnce(anim)
    npc.syncAnimationsForAll(builder);
}

var thread = java.lang.Thread
function threadrun(runnable) {
    var addThread = Java.extend(thread, {
        run: runnable
    })
    try {
        var H = new addThread()
        H.start()
    } catch (err) {
        print(err)
    }
}
