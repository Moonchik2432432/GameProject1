var model = "conquest:black_studded_door";
var item = "Ключ";
var doorClose = [
"§4Я не могу открыть дверь",
 "§4Нужен ключ, чтобы открыть дверь", 
 "§4Должен быть способ, открыть дверь"
 ];
var doorOpen = "§2Дверь открыта";

function init(e) {
//Модель и сохраняет в данных мира про дверь
var block = e.block;
var blockStoredata = block.getStoreddata();
    block.setBlockModel(model);
    if (!blockStoredata.has("doorOpenShip")) {
        blockStoredata.put("doorOpenShip", 0); 
    }
}

function interact(e) {
    var player = e.player;
    var storedData = e.block.getStoreddata();
    var open = storedData.get("doorOpenShip"); 
    var doorClosed = doorClose[Math.floor(Math.random() * doorClose.length)];

        if (player.getMainhandItem().getDisplayName() == item && open == 0) {
        //Сохраняем данные когда дверь открыта
            e.setCanceled(false);
            player.message(doorOpen);
            storedData.put("doorOpenShip", 1); 
        } else if (open == 0 && player.getMainhandItem().getDisplayName() != item) {
            e.setCanceled(true);
            player.message(doorClosed);
        } else {
            e.setCanceled(false);
    }
}
