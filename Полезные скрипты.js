//Полезные скрипты 
//Гм1,Гм2,Гм3
function chat(e) {
    if (e.message == "gm 1") {
        e.setCanceled(true);
        e.player.setGamemode(1)
    }
    if (e.message == "gm 2") {
        e.setCanceled(true);
        e.player.setGamemode(2)
    }
    if (e.message == "gm 3") {
        e.setCanceled(true);
        e.player.setGamemode(3)
    }
}

//Ночное видения
function tick(e) {
    if (e.player.nbt.getBoolean("nv")) {
        e.player.addPotionEffect(16, 15, 20, 0)
    }
}
function chat(e) {
    if (e.message == "n1") {
        e.setCanceled(true)
        e.player.nbt.setBoolean("nv", true)
        return;
    }
    if (e.message == "n0") {
        e.setCanceled(true)
        e.player.clearPotionEffects()
        e.player.nbt.setBoolean("nv", false)
        return;
    }
}

//heal
function chat(e) {
    if (e.message == "heal") {
        e.setCanceled(true)
        e.player.setHealth(20)
        e.player.setHunger(20)
        return;
    }
}

