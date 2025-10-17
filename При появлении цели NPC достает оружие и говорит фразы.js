var npcLineTarget = [
"Сейчас, я отправлю тебя на дно", 
"Иди сюда, сухопутная крыса",
 "Ты у меня будешь кормить рыб, сойдемся якорями!"
 ];
 
var npcLineLTarget = 
["Да, побрататься с морским дьяволом, убежал", 
"Снялся с якоря, корабельная крыса",
 "Беги, беги корабельная крыса!"
 ];
 
var npcWeapon = "minecraft:wooden_sword";

function target(e) {
  var lineTarget = npcLineTarget[Math.floor(Math.random() * npcLineTarget.length)];
  var npc = e.npc;  
  
      // Если NPC не держит оружие, достаем деревянный меч
      if (npc.getMainhandItem() != npcWeapon) {
        npc.setMainhandItem(npc.world.createItem(npcWeapon, 1));   
        // Если хп меньше от макс хп, NPC не говорит одну из фраз
        if (npc.getHealth() == npc.getMaxHealth()) {
          npc.say(lineTarget);
    }
  }
}

function targetLost(e) {
  var npc = e.npc;
  var entity = e.entity;
  var npcMainhand = npc.getMainhandItem();
  var lineLTarget = npcLineLTarget[Math.floor(Math.random() * npcLineLTarget.length)];
  
    // При потери цели NPC убирает оружие
      if (npcMainhand != null && npcMainhand.getName() == npcWeapon) {
        npc.setMainhandItem(null);
          // Если цель убежала, то говорит одну фразу
          if (entity != null && entity.getHealth() > 0 && npc.getHealth() == npc.getMaxHealth()) {
              npc.say(lineLTarget);
      } 
  }
 } 
 




