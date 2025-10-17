var TARGET_BLOCKS = {
    "minecraft:iron_ore": "§7Железная руда", // Белый
    "minecraft:gold_ore": "§6Золотая руда", // Золотой
    "minecraft:coal_ore": "§0Угольная руда", // Черный
    "minecraft:diamond_ore": "§bАлмазная руда", // Бирюзовый
    "minecraft:emerald_ore": "§2Изумрудная руда", // Зеленый
    "minecraft:lapis_ore": "§1Лазуритовая руда", // Синий
    "minecraft:copper_ore": "§eМедная руда", // Желтый
    "minecraft:redstone_ore": "§4Редстоун руда" // Красный
};

var searchRadius = 20;

function interact(e) {
    var npc = e.npc;
    var npcPos = npc.getPos();
    var world = npc.getWorld();

    searchCoordinateBlock(searchRadius, npc, npcPos, world);
}

function searchCoordinateBlock(radius, npc, npcPos, world) {
    var found = false;

    for (var x = -radius; x <= radius; x++) {
        for (var y = -radius; y <= radius; y++) {
            for (var z = -radius; z <= radius; z++) {
                var bx = npcPos.x + x;
                var by = npcPos.y + y;
                var bz = npcPos.z + z;

                var block = world.getBlock(bx, by, bz);
                var id = block.getName();

                if (TARGET_BLOCKS[id]) {
                    var name = TARGET_BLOCKS[id];
                    npc.say(name + "§r найден на координатах: х:§a" + bx + "§r; y:§a" + by + "§r; z:§a" + bz);

                    // Задержка между выводами сообщений
                    java.lang.Thread.sleep(500); // Пауза в 0.5 секунду
                    found = true;
                }
            }
        }
    }

    if (!found) {
        npc.say("Нету руды!");
    }
}
