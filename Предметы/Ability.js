var abilities = {
    fireBurst: function (player, target) {
        player.message("§cВы выпустили огненный взрыв!");
        if (target && target.setBurning) {
            target.setBurning(5);
        }
    },
    healPulse: function (player) {
        player.message("§aВы исцелили себя!");
        player.setHealth(player.getHealth() + 10);
    }
    // добавляй сколько хочешь
};
