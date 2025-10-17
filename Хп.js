function init(e) {
    var item = e.item
    item.setTexture("minecraft:enchanted_golden_apple");
    item.setDurabilityShow(false);
}

var health;
var gui;

// function interact(e) {
//     e.player.setMaxHealth(20);
//     e.player.setHealth(20);
// }

function interact(e) {
    var player = e.player;
    health = player.getMaxHealth()

    gui = e.API.createCustomGui(1, 10, 10, false);

    gui.addTextField(1, -90, -10, 190, 20)
    gui.addLabel(2, "Введите максимальное количество ХП", -90, -30, 190, 20)
    gui.addButton(3, "Нажать", -90, 20)
    gui.getComponent(1).setText(health + "");
    player.showCustomGui(gui);
}

function customGuiButton(e) {
    var player = e.player
    if (e.buttonId == 3) {
        var text = gui.getComponent(1).getText();
        var numberHealth = parseInt(text);

        if (!isNaN(numberHealth) && numberHealth > 0) {
            player.setMaxHealth(numberHealth);
            player.setHealth(numberHealth);
            player.message("Установлено ХП: " + numberHealth);
            player.closeGui();
        } else {
            gui.getComponent(2).setColor(2)
            gui.getComponent(2).setText("Введите корректное число")
            gui.update(player)
        }
    }
}


