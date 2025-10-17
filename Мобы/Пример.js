var npcData = {
  sound: {
    attack: "minecraft:entity.spider.hurt",
    damaged: "customnpcs:termit_damaged",
    death: "customnpcs:termit_death"
  },
  animation: {
    attack: ["animation.crap.attack1", "animation.crap.attack2"],
    death: ["animation.crap.death"]
  },
  attackStats: {
    damage: [3, 5],
    range: 2,
    damageCooldown: [25, 16],
    powerKnockback: 0.9
  }
};

//флаги на нпс и обьект атаки нпс
var object;
var attacker;

//флаги на активацию смерти, атаки и рандомная атака
var deathAnimation = false;
var randomAttack;
var isAttacking = false;

//сокращения
var animationAttack = npcData.animation.attack;
var animationDeath = npcData.animation.death;

function init(e) {
  var npc = e.npc;
  var randomHp = Math.floor(Math.random() * (19 - 16 + 1)) + 16;

  deathAnimation = false;
  npc.display.setVisible(0);
  npc.ai.setWalkingSpeed(3);
  npc.setMaxHealth(randomHp);
  npc.updateClient();
}

function meleeAttack(e) {
  var npc = e.npc;
  var npcTimer = npc.getTimers();

  // Если переменная истиная то он не атакует
  if (isAttacking) {
    e.setCanceled(true);
    return;
  }

  // При атаке он запонимает местоположения врага
  object = e.target;
  attacker = npc;

  randomAttack = Math.floor(Math.random() * animationAttack.length);
  e.setCanceled(true);
  isAttacking = true; // включаеться флаг атаки,

  npcTimer.forceStart(100, 0, false); // стартует таймер для других таймеров атаки
}

function timer(e) {
  //сокращения
  var id = e.id;
  var npc = e.npc;
  var npcTimerAttack = npc.getTimers();

  if (id === 100) {
    if (deathAnimation) return; // если вкл флаг анимаций смерти, то не происходит атака
    playAnim(animationAttack[randomAttack], npc);

    if (randomAttack === 0) {
      npcTimerAttack.forceStart(150, npcData.attackStats.damageCooldown[0], false);
    } else if (randomAttack === 1) {
      npcTimerAttack.forceStart(151, npcData.attackStats.damageCooldown[1], false);
    }
  }

  if (id === 150) {
    performAttack(npcData.attackStats.damage[0], npcData.attackStats.range);
  } else if (id === 151) {
    performAttack(npcData.attackStats.damage[1], npcData.attackStats.range);
  }
}

function performAttack(damage, range) {
  //получения мира NPC и его таймер
  var npcWorld = attacker.world;
  var npcTimer = attacker.getTimers();
  //Получение всех сущностей в радиусе атаки
  var victims = attacker.world.getNearbyEntities(attacker.getPos(), range, null);

  npcWorld.playSoundAt(attacker.pos, npcData.sound.attack, 0.5, 0.8 + Math.random() * 0.2);

  for (var i = 0; i < victims.length; i++) {
    // проверяется, что сущность, которую мы обрабатываем, не является самим NPC
    if (victims[i] !== attacker && victims[i].getName() !== "Черт") {
      if (victims.length > 0 && !deathAnimation && object) {
        object.damage(damage);
        knockback(npcData.attackStats.powerKnockback);
      }
    }
  }
  npcTimer.stop(150);
  npcTimer.stop(151);
  npcTimer.stop(100);
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
  var npc = e.npc;
  var npcWorld = npc.world;
  var npcDisplay = npc.display;
  var randomDied = Math.floor(Math.random() * animationDeath.length);

  //если переменная ложная, то проигрываеться звук при получения урона
  if (!deathAnimation) {
    npcWorld.playSoundAt(npc.pos, npcData.sound.attack, 0.4, 0.8 + Math.random() * 0.2);
  }

  //если переменная истиная и урона меньше 9999 то он не получает урон
  if (deathAnimation && e.damage < 9999) {
    e.setCanceled(true);
    return;
  }

  //если у нпс нет хп и переменная истиная, то выполняеться код
  if (e.damage >= npc.getHealth() && !deathAnimation) {
    e.setCanceled(true);
    npcWorld.playSoundAt(npc.pos, npcData.sound.death, 0.5, 1);
    npc.ai.setWalkingSpeed(0);
    deathAnimation = true; //переменная становиться истиной

    playAnim(animationDeath[randomDied], npc);

    threadrun(function () {
      if (randomDied === 0) {
        thread.sleep(1600);
      } else if (randomDied === 1) {
        thread.sleep(2100);
      }

      npcWorld.spawnParticle("soul", npc.x, npc.y + 0.6, npc.z, 0, 0, 0, 0.1, 90);
      npcDisplay.setVisible(1);
      npcDisplay.setHitboxState(1);
      npc.updateClient();
      npc.damage(9999);//конечный урон для убийства нпс
    });
  }
}

function died(e) {
  deathAnimation = false;//сбрасываем флаг
}

//анимация
function playAnim(anim, npc) {
  try {
    var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
    var builder = api.createAnimBuilder();
    builder.playOnce(anim).playOnce(anim);
    npc.syncAnimationsForAll(builder);
  } catch (err) {
    print("Ошибка в playAnim: " + err);
  }
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
