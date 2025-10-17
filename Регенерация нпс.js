//регенерация
  function damaged(e) {
  var npc = e.npc;
  var npcTimer = npc.getTimers();
  
    if (npcTimer.has(1)) {
        npcTimer.stop(1);
    }
        npcTimer.start(1,60,true);
}

  function timer(e) {
  if(e.id == 1) {
    var npc = e.npc;
    var currentHealth = npc.getHealth();
    var maxHealth = npc.getMaxHealth();    
    
    // Увеличиваем здоровье только если оно меньше максимального
        if (currentHealth < maxHealth) {
            npc.setHealth(currentHealth + 1);
  }
 } 
}