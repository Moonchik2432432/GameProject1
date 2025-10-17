var npcData = {
  sound: {
    attack: ["minecraft:entity.player.attack.strong", "minecraft:entity.player.attack.nodamage"],
    damaged: "customnpcs:crap_damaged",
    death: "customnpcs:crap_death",
    dodge: ["minecraft:entity.ender_dragon.flap", "minecraft:item.armor.equip_turtle"],
    laughter: "customnpcs:crap_laughter",
    idle: ["customnpcs:crap_idle1", "customnpcs:crap_idle2"],
    breakArmor: "minecraft:entity.item.break"
  },
  animation: {
    attack: ["animation.crap.attack1", "animation.crap.attack2"],
    death: ["animation.crap.death", "animation.crap.death1"],
    dodge: "animation.crap.dodge",
    walk: ["animation.crap.walk", "animation.crap.run"],
    idle: "animation.crap.idle"
  },
  attackStats: {
    damage: [4, 5],
    range: 2,
    damageCooldown: [25, 16],
    powerKnockback: 1.0
  },
  npcStats: {
    walkingSpeed: 3,
    runningSpeed: 5,
    maxHealthRange: [20, 23],
    blockChance: 20,
    powerDodge: 2
  },
  armorStats: {
    modelArmor: ["geckolib3:geo/crap/crap3.geo.json", "geckolib3:geo/crap/crap3.1.geo.json", "geckolib3:geo/crap/crap3.2.geo.json"],
    breakChance: 20,
    armorStatus: 0,
    procentResistance: null
  }
};

var object;
var attacker;

var deathAnimation = false;
var isAttacking = false;
var isDodge = false;

var randomAttack;
var randomDogde;

var animationAttack = npcData.animation.attack;
var animationDeath = npcData.animation.death;

function init(e) {
  var npc = e.npc;
  var npcTimerIdle = npc.getTimers();
  var maxHealth = Math.floor(Math.random() * (npcData.npcStats.maxHealthRange[1] - npcData.npcStats.maxHealthRange[0] + 1)) + npcData.npcStats.maxHealthRange[0]

  deathAnimation = false;
  npc.display.setVisible(0);
  npc.ai.setWalkingSpeed(3);
  npc.setMaxHealth(maxHealth);
  npcTimerIdle.forceStart(5, 450, true);
  npcData.armorStats.procentResistance = npc.getStats().getResistance(0).toFixed(2)
  npc.updateClient();
}

function target(e) {
  var npc = e.npc;
  if (!deathAnimation) {
    npc.ai.setWalkingSpeed(npcData.npcStats.runningSpeed);
    npc.setGeckoWalkAnimation(npcData.animation.walk[1]);
  }
}

function targetLost(e) {
  var npc = e.npc;
  if (!deathAnimation) {
    npc.ai.setWalkingSpeed(npcData.npcStats.walkingSpeed);
    npc.setGeckoWalkAnimation(npcData.animation.walk[0]);
  }
}

function meleeAttack(e) {
  var npc = e.npc;
  var npcTimer = npc.getTimers();
  if (isAttacking || isDodge) {
    e.setCanceled(true);
    return;
  }
  object = e.target;
  attacker = npc;

  randomAttack = Math.floor(Math.random() * animationAttack.length);
  e.setCanceled(true);
  isAttacking = true;
  npcTimer.forceStart(100, 0, false);
}

function timer(e) {
  var id = e.id;
  var npc = e.npc;
  var getTimers = npc.getTimers();
  if (id === 100) {
    if (deathAnimation) return;
    playAnim(animationAttack[randomAttack], npc);
    if (randomAttack === 0 && !isDodge) {
      getTimers.forceStart(150, npcData.attackStats.damageCooldown[0], false);
    } else if (randomAttack === 1 && !isDodge) {
      getTimers.forceStart(151, npcData.attackStats.damageCooldown[1], false);
    }

  }
  if (id === 150) {
    performAttack(npcData.attackStats.damage[0], npcData.attackStats.range);
  } else if (id === 151) {
    performAttack(npcData.attackStats.damage[1], npcData.attackStats.range);
  }

  if (id === 5) {
    if (!object) {
      npc.world.playSoundAt(npc.pos, npcData.sound.idle[Math.floor(Math.random() * npcData.sound.idle.length)], 0.3, 0.8 + Math.random() * 0.2);
    }
  }
}

function performAttack(damage, range) {
  var npcWorld = attacker.world;
  var npcTimer = attacker.getTimers();
  var victims = attacker.world.getNearbyEntities(attacker.getPos(), range, null);
  if (!isDodge) {
    npcWorld.playSoundAt(attacker.pos, npcData.sound.attack[randomAttack], 0.5, 0.8 + Math.random() * 0.2);
  }
  for (var i = 0; i < victims.length; i++) {
    if (victims[i] !== attacker) {
      if (!deathAnimation && object && !isDodge) {
        object.damage(damage);
        knockback(npcData.attackStats.powerKnockback);
        npcWorld.playSoundAt(attacker.pos, npcData.sound.laughter, 0.5, 0.8 + Math.random() * 0.2);
      }
    }
  }
  npcTimer.stop(150);
  npcTimer.stop(151);
  npcTimer.stop(100);
  isAttacking = false;
}

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
  npcData.armorStats.procentResistance = npc.getStats().getResistance(0).toFixed(2)

  if (deathAnimation && e.damage < 9999) {
    e.setCanceled(true);
    return;
  }

  if (!deathAnimation && Math.random() <= (npcData.npcStats.blockChance / 100) && !isDodge && e.damage <= npc.getHealth()) {
    e.setCanceled(true);
    playAnimDodge(npcData.animation.dodge, npc);
    isDodge = true;
    dodge(e.npc, npcData.npcStats.powerDodge)
  }

  if (!deathAnimation && !isDodge && e.damage <= npc.getHealth()) {
    npcWorld.playSoundAt(npc.pos, npcData.sound.damaged, 0.4, 0.8 + Math.random() * 0.2);
  }

  if (!deathAnimation && !isDodge && e.damage <= npc.getHealth() && Math.random() <= (npcData.armorStats.breakChance / 100) && npcData.armorStats.procentResistance > 1.05) {
    destroyedSetArmorModel(npc)
  }

  if (e.damage >= npc.getHealth() && !deathAnimation) {
    e.setCanceled(true);
    npcWorld.playSoundAt(npc.pos, npcData.sound.death, 0.5, 1);
    npc.ai.setWalkingSpeed(0);
    deathAnimation = true;
    playAnim(animationDeath[randomDied], npc);
    threadrun(function () {
      if (randomDied === 0) {
        thread.sleep(2500);
      } else if (randomDied === 1) {
        thread.sleep(2200);
      }
      npcWorld.spawnParticle("soul", npc.x, npc.y + 0.6, npc.z, 0, 0, 0, 0.1, 90);
      npcDisplay.setVisible(1);
      npcDisplay.setHitboxState(1);
      npc.updateClient();
      npc.damage(9999);
    });
  }
}

function dodge(npc, power) {
  var world = npc.world
  var ai = npc.ai
  var rotation = (npc.rotation + 180) * Math.PI / 180;// Перевод в радианы

  isDodge = true;
  npc.world.playSoundAt(npc.pos, npcData.sound.dodge[0], 0.8, 0.6);

  threadrun(function () {
    thread.sleep(270)
    world.spawnParticle("cloud", npc.x, npc.y + 0.2, npc.z, 0, 0, 0, 0.1, 20);
    npc.motionX += power * Math.cos(rotation);
    npc.motionZ += power * Math.sin(rotation);
    if (!deathAnimation) {
      ai.setWalkingSpeed(0);
      thread.sleep(950)
      if (object) {
        ai.setWalkingSpeed(npcData.npcStats.runningSpeed);
      } else {
        ai.setWalkingSpeed(npcData.npcStats.walkingSpeed);
      }
      world.playSoundAt(npc.pos, npcData.sound.dodge[1], 0.8, 0.6);
      world.playSoundAt(npc.pos, npcData.sound.laughter, 0.5, 0.8 + Math.random() * 0.2);
      world.spawnParticle("cloud", npc.x, npc.y + 0.2, npc.z, 0, 0, 0, 0.1, 20);
      thread.sleep(150)
    }
    isDodge = false;
  });
}

function destroyedSetArmorModel(npc) {
  var world = npc.world
  npcData.armorStats.procentResistance = npcData.armorStats.procentResistance - 0.15
  npc.getStats().setResistance(0, npcData.armorStats.procentResistance)
  npcData.armorStats.armorStatus++
  world.playSoundAt(npc.pos, npcData.sound.breakArmor, 0.5, 0.8 + Math.random() * 0.2);
  world.spawnParticle("smoke", npc.x, npc.y + 0.2, npc.z, 0, 0, 0, 0.2, 50);
  npc.setGeckoModel(npcData.armorStats.modelArmor[npcData.armorStats.armorStatus])
}

function playAnim(anim, npc) {
  var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
  var builder = api.createAnimBuilder();
  builder.playOnce(anim).playOnce(anim);
  npc.syncAnimationsForAll(builder);
}

function playAnimDodge(anim, npc) {
  var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
  var builder = api.createAnimBuilder();
  builder.playOnce(anim)
  npc.syncAnimationsForAll(builder);
}


var thread = java.lang.Thread;

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

