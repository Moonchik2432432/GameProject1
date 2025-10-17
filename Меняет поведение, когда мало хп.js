var npcLineType = [
"Сняться якорями!", 
"Ради морского черта, не убивай меня", 
"Не убивай меня, я не хочу отправляться за сундуком Дейви Джонса"
];
var healthCheck = 0;

function tick(e) {
    var lineType = npcLineType[Math.floor(Math.random() * npcLineType.length)];
    var npc = e.npc;
    var npcAi = npc.ai;
    var npcGetAi = npc.getAi();
    var healthNpc = (npc.getHealth() / npc.getMaxHealth()) * 100;
    
        if(healthNpc < 25 && healthCheck == 0) {
            npc.say(lineType);
            healthCheck = 1;
            npcAi.setRetaliateType(2);
            npcGetAi.setWalkingSpeed(6);
        }
        else if(healthNpc > 25 && healthCheck == 1) {
            npcAi.setRetaliateType(0);
            npcGetAi.setWalkingSpeed(5);
            healthCheck = 0;
            }
}