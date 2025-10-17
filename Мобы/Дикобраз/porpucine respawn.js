var npcData = {
    sound: {
        attack: ["minecraft:entity.player.attack.strong", "minecraft:entity.player.attack.nodamage"],
        damaged: "customnpcs:crap_damaged",
        death: "customnpcs:crap_death",
        protection: ["minecraft:entity.ender_dragon.flap", "minecraft:item.armor.equip_turtle"],
    },
    animation: {
        attack: "animation.porpucine.hit",
        death: "animation.porpucine.death",
        protection: "animation.porpucine.protection",
    },
    attackStats: {
        damage: 3,
        range: 2,
        damageCooldown: 14,
        powerKnockback: 1.0
    },
    npcStats: {
        walkingSpeed: 4,
        maxHealthRange: [16, 19],
    },
    protection: {
        protectionChance: 35,
    }
};
//флаги на нпс и обьект атаки нпс
var object;
var attacker;

//флаги на активацию смерти, атаки и защиты
var deathAnimation;
var isAttacking;
var isProtectionIdle;

//сокращения
var animationAttack = npcData.animation.attack;
var animationDeath = npcData.animation.death;

//сокращения2
var npc;
var npcTimer;
var npcDisplay;

var respawnTime;

var maxHealth = Math.floor(Math.random() * (npcData.npcStats.maxHealthRange[1] - npcData.npcStats.maxHealthRange[0] + 1)) + npcData.npcStats.maxHealthRange[0]

function init(e) {
    npc = e.npc;
    npcTimer = npc.getTimers();
    npcDisplay = npc.display;

    respawnTime = npc.getStats().getRespawnTime();

    if (npc.getHealth() > 0) {
        isAttacking = false;
        isProtectionIdle = false
        deathAnimation = false;
        npc.display.setVisible(0);
        npc.ai.setWalkingSpeed(npcData.npcStats.walkingSpeed);
        npc.setMaxHealth(maxHealth);
    }
    npc.updateClient();
}

function meleeAttack(e) {
    // При атаке он запонимает местоположения врага
    object = e.target;
    attacker = e.npc;

    // Если переменная истиная то он не атакует
    if (isAttacking || deathAnimation || isProtectionIdle) {
        e.setCanceled(true);
        return;
    }

    if (!isAttacking && !isProtectionIdle) {
        npcTimer.forceStart(100, npcData.attackStats.damageCooldown, false); // стартует таймер для других таймеров атаки
        playAnim(animationAttack, npc);
        isAttacking = true; // включаеться флаг атаки,
    }
}

function timer(e) {
    //атака
    if (e.id === 100) {
        performAttack(npcData.attackStats.damage, npcData.attackStats.range);
    }
    //конец защиты
    if (e.id === 150 && !deathAnimation) {
        npc.ai.setWalkingSpeed(npcData.npcStats.walkingSpeed);
        npc.getStats().setResistance(0, 1);
        npc.getStats().setResistance(3, 1);
        isProtectionIdle = false;
    }
    //возрождения
    if (e.id === 10) {
        npcDisplay.setHitboxState(0);
        npcDisplay.setVisible(0);
        npc.ai.setWalkingSpeed(npcData.npcStats.walkingSpeed);
        npc.getStats().setResistance(0, 1);
        npc.getStats().setResistance(3, 1);
        deathAnimation = false;
        isAttacking = false;
        isProtectionIdle = false;
        npc.updateClient();
    }
}

function performAttack(damage, range) {
    //Получение всех сущностей в радиусе атаки
    var victims = npc.world.getNearbyEntities(npc.getPos(), range, null);

    npc.world.playSoundAt(npc.pos, npcData.sound.attack, 0.5, 0.8 + Math.random() * 0.2);

    for (var i = 0; i < victims.length; i++) {
        // проверяется, что сущность, которую мы обрабатываем, не является самим NPC
        if (victims[i] !== attacker) {
            if (victims.length > 0 && object) {
                object.damage(damage);
                knockback(npcData.attackStats.powerKnockback);
            }
        }
    }
    isAttacking = false; // сбрасываем таймер и флаги для атаки
}

// функция отталкивание при ударе
function knockback(power) {
    if (object != null && attacker != null) {
        var dx = object.x - attacker.x;
        var dy = object.y - attacker.y;
        var dz = object.z - attacker.z;

        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist !== 0) {
            object.motionX = (dx / dist) * power;
            object.motionY = (dy / dist) * power;
            object.motionZ = (dz / dist) * power;
        }
    }
}

function damaged(e) {
    var npcGetStats = npc.getStats()
    //если переменная ложная, то проигрываеться звук при получения урона
    if (!deathAnimation) {
        npc.world.playSoundAt(npc.pos, npcData.sound.attack, 0.4, 0.8 + Math.random() * 0.2);
    }
    //если переменная истиная и урона меньше 9999 то он не получает урон
    if (deathAnimation && e.damage < 9999) {
        e.setCanceled(true);
        npc.say("он мертв")
        return;
    }

    //Наносить урон атакующиму
    if (isProtectionIdle && !deathAnimation && e.source.type !== undefined) {
        var reflected = e.damage / 100 * 100;
        e.source.damage(reflected);
    }

    //Шанс на защитную стойку
    if (Math.random() <= (npcData.protection.protectionChance / 100) && !isProtectionIdle && !deathAnimation) {
        isProtectionIdle = true;
        playAnimProtection(npcData.animation.protection, e.npc);
        npcGetStats.setResistance(0, 1.5);
        npcGetStats.setResistance(3, 1.9);
        npc.ai.setWalkingSpeed(0);
        npcTimer.forceStart(150, 70, false)

    }

    //если у нпс нет хп и переменная истиная, то выполняеться код
    if (e.damage >= npc.getHealth() && !deathAnimation) {
        e.setCanceled(true);
        npc.world.playSoundAt(npc.pos, npcData.sound.death, 0.5, 1);
        npc.ai.setWalkingSpeed(0);
        deathAnimation = true; //переменная становиться истиной

        playAnim(animationDeath, e.npc);

        threadrun(function () {
            thread.sleep(1750);
            npc.world.spawnParticle("soul", npc.x, npc.y + 0.6, npc.z, 0, 0, 0, 0.1, 90);
            npcDisplay.setVisible(1);
            npcDisplay.setHitboxState(1);
            npc.updateClient();
            npc.damage(9999);//конечный урон для убийства нпс
        });
    }
}

function died(e) {
    deathAnimation = true
    npcTimer.forceStart(10, respawnTime * 20, false);
}

//анимация
function playAnim(anim, npc) {
    var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
    var builder = api.createAnimBuilder();
    builder.playOnce(anim).playOnce(anim);
    npc.syncAnimationsForAll(builder);
}

function playAnimProtection(anim, npc) {
    var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
    var builder = api.createAnimBuilder();
    builder.playOnce(anim);
    npc.syncAnimationsForAll(builder);
}

var thread = java.lang.Thread;

//поток
function threadrun(runnable) {
    var addThread = Java.extend(thread, {
        run: runnable
    });

    try {
        var H = new addThread();
        H.start();
    } catch (err) {
        print("Ошибка в threadrun: " + err);
    }
}
