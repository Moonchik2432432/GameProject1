
//Подкласс защитного предметов из класс предметов
function DefenseItem(id, player, name, type, lore, cost, rarity, armorType, reqStrength, reqAgility, resistance) {
    Item.call(this, id, player, name, type, lore, cost, rarity)
    this.armorType = armorType;
    this.reqStrength = reqStrength;
    this.reqAgility = reqAgility;
    this.resistance = {
        chopping: resistance[0],
        crushing: resistance[1],
        piercing: resistance[2],
        elemental: resistance[3],
        magical: resistance[4]
    }
}

//Лор для защитного предмета
DefenseItem.prototype = Object.create(Item.prototype);
DefenseItem.prototype.constructor = DefenseItem;

DefenseItem.prototype.setLoreArmor = function (lore, line, space) {
    lore.push(
        "§7Тип брони: §b" + translateWord(this.armorType)
    )

    lore.push(space, line,
        "§7Сопротивления:",
        "§8 * Рубящий: §c" + this.resistance.chopping,
        "§8 * Дробящий: §c" + this.resistance.crushing,
        "§8 * Колющий: §c" + this.resistance.piercing,
        "§8 * Стихийный: §c" + this.resistance.elemental,
        "§8 * Магический: §c" + this.resistance.magical
    )

    if (this.reqStrength > 0 || this.reqAgility > 0) {
        lore.push(space, line)
        if (this.reqStrength > 0) lore.push("§7Требуеться сила: §5" + this.reqStrength);
        if (this.reqAgility > 0) lore.push("§7Требуеться ловкость: §5" + this.reqAgility);
    }
}

DefenseItem.prototype.setNBTArmor = function (nbt) {
    nbt.putString("armorType", this.armorType);
    nbt.setInteger("chopping", this.resistance.chopping);
    nbt.setInteger("crushing", this.resistance.crushing);
    nbt.setInteger("piercing", this.resistance.piercing);
    nbt.setInteger("elemental", this.resistance.elemental);
    nbt.setInteger("magical", this.resistance.magical);
    nbt.setInteger("reqStrength", this.reqStrength);
    nbt.setInteger("reqAgility", this.reqAgility);
}

// Функция инициализации (например, вызов из события)
function init(e) {
    itemRpg = new DefenseItem(
        "minecraft:golden_helmet", // ID предмета
        e.player,// Игрок
        "Золотистый шлем", // Название
        "armor", // Тип Weapon/Armor/Consumables/Material/Keyitem/Document
        "Шлем сделанный из золото/Не очень хороший защите", // Описание, разделённое 
        450, // Стоимость
        "soldier",  // Редкость

        //броня
        "helmet", //Тип брони
        10, // Требуемая сила
        10, // Требуемая ловкость
        [40, 30, 20, 4, 4] //режущий/дробящий/колющий/стихийный/магический
    );

    itemRpg.giveItemPlayer();
}


