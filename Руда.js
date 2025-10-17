var oremodel = "vutils:adamantiteore"; // Отображение блока руды

var itemToGive = [
[ //-----------------------—
"vutils:adamantite",
"§6§lАдамантитовая руда",
[
"§8§l✹ §oТип предмета §8§l: §6§lРуда",
" ",
"§6Используется в создании проклятого оружия и брони.",
"§6Главный компонент в создании §4§lкрасного оружия",
"§8§lРегион: §6§lПустыня",
],
]
]

var pickaxe = [ // Инструмент для добычи руды
//Айди, скорость добычи, шанс двойной добычи
["minecraft:diamond_pickaxe", 2.5, 5],
["minecraft:iron_pickaxe", 5, 5],
["minecraft:golden_pickaxe", 10, 20],
];

var durability = 1 //Сколько прочности отнимает у инструмента в руке после добычи предмета
var progressValue = 2.5; //Сколько процентов за раз добавляет к прогрессу
var secfr = 600; // Респавн руды в секундах
var refresh = true;

var progress = 0;
var p = 0;
function init(e) {
var sd = e.block.getStoreddata();
if (refresh) {
e.block.timers.forceStart(2, 0, false);
return;
}
if (sd.get("mined") == null) {
sd.put("mined", 0);
}
if (sd.get("mined") == 0) {
e.block.setModel(oremodel);
} else {
progress = 100;
e.block.setModel("minecraft:sandstone");
e.block.timers.forceStart(2, secfr * 20, false);
}
e.block.setHardness(-1);
e.block.setRotation(0, 270, 0);
}
function interact(e) {
var sd = e.block.getStoreddata();
var a = 0;
if (progress == 100)
e.block.executeCommand('/title @p actionbar {"text":"\u00A75Вы уже добыли эту руду."}');
for (var i = 0; i < pickaxe.length; i++) {
if (e.player.getMainhandItem().getName() == pickaxe[i][0] && progress < 100) {
progress = progress + pickaxe[i][1];
a = pickaxe[i][2];
e.block.world.playSoundAt(e.block.pos, "minecraft:block.metal.break", 1, 1)
e.block.executeCommand('/title @p actionbar {"text":"« \u00A75' + progress + '% \u00A7f»"}');
break;
}
}
if (progress >= 100) {
p = 1;
e.block.setModel("minecraft:sandstone");
}
if (progress >= 100 && e.block.timers.has(2) == false && p == 1) {

e.player.getOffhandItem().setItemDamage(e.player.getOffhandItem().getItemDamage() + durability)

for (var i = 0; i < itemToGive.length; i++) {
var customItem = e.player.world.createItem(itemToGive[i][0], 0, 1)
customItem.setCustomName(itemToGive[i][1])
customItem.setLore(itemToGive[i][2])
e.player.giveItem(customItem)
if (Math.random() <= (a / 100))
e.player.giveItem(customItem)
}
sd.put("mined", 1);
e.block.timers.forceStart(2, secfr * 20, false);


}
}
function timer(e) {
var sd = e.block.getStoreddata();
if (e.id == 2) {
progress = 0;
p = 0;
sd.put("mined", 0);
e.block.setModel(oremodel);
}
}