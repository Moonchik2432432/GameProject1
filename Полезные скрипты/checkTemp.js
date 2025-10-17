function checkTemp(xp, point) {
    var temp = this.player.getTempdata();
    if (temp.has("xpQueue") && temp.has("pointQueue")) {
        var xpQueue = temp.get("xpQueue");
        var pointQueue = temp.get("pointQueue");

        if (xpQueue.length > 0 && pointQueue.length > 0) {
            var xp = xpQueue.shift();
            var point = pointQueue.shift();

            // Обновляем очереди
            temp.put("xpQueue", xpQueue);
            temp.put("pointQueue", pointQueue);

            return [xp, point]; // ← Возвращаем как массив
        }
    }
    return null; // если ничего нет
}