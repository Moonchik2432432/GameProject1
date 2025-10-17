function showActionBar(text, color, api, player) {
    var command = '/title ' + player.getName() + ' actionbar {"text":"' + text + '","color":"' + color + '"}';
    api.executeCommand(player.world, command);
}