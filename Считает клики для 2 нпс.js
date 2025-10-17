function attack(t) {
    //Поскольку они похожи на переменные, нам нужно их инициализировать. Мы хотим сделать это только в том случае, если у игрока НЕТ переменной, чтобы она не всегда сбрасывалась на 0.
    // По существу: "если у игрока НЕТ переменной, дайте ему переменную на счете 0"
    if (!t.player.getStoreddata().has("Clicks")) {
        t.player.getStoreddata().put("Clicks", 0)
    }

    //Получить предыдущий счетчик смертей игрока, увеличить его на 1 и сохранить новое значение
    var PreviousClicks = t.player.getStoreddata().get("Clicks")
    var NewClicks = PreviousClicks + 1
    t.player.getStoreddata().put("Clicks", NewClicks)
}

//NPC 2 SCRIPT
function interact(t) {
    var playerClicks = t.player.getStoreddata().get("Clicks")
    t.npc.say("You've clicked " + playerClicks + " times.")
}