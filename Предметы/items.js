var itemRpg;

// Общий класс для всех предметов
function Item(id, player, name, type, lore, cost, rarity) {
    this.id = id;
    this.player = player;
    this.name = name;
    this.type = type;
    this.lore = lore;
    this.cost = cost;
    this.rarity = rarity;

    this.item = this.player.getWorld().createItem(id, 1);
}

// Цвет для редкости
Item.prototype.getRarityColor = function () {
    switch (this.rarity.toLowerCase()) {
        case "common": return "§7";
        case "soldier": return "§a";
        case "veteran": return "§3";
        case "royal": return "§d";
        case "divine": return "§6";
        default: return "§f";
    }
}

// Формирование лора для предмета
Item.prototype.setLoreItem = function () {
    var lore = [];
    var space = " ";
    var line = this.getRarityColor() + "§m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

    lore.push(
        "§7Тип предмета: " + translateWord(this.type),
        "§7Редкость: §r" + this.getRarityColor() + translateWord(this.rarity)
    );

    if (this.type === "weapon" && typeof this.setLoreWeapon === "function") {
        this.setLoreWeapon(lore, space, line);
    }

    if (this.type === "armor" && typeof this.setLoreArmor === "function") {
        this.setLoreArmor(lore, space, line);
    }

    lore.push(space, line, space);

    var loreItem = this.lore.split('/');
    for (var i = 0; i < loreItem.length; i++) {
        lore.push("§f" + loreItem[i]);
    }

    lore.push(space, line, space);

    lore.push("§eСтоимость: " + this.cost);

    this.item.setLore(lore);
}

// Применение NBT и предмет
Item.prototype.setNBT = function () {
    var nbt = this.item.getNbt()

    this.item.setCustomName(this.getRarityColor() + this.name);
    nbt.setInteger("HideFlags", 63);
    nbt.setBoolean("Unbreakable", true);

    //свои нбт
    nbt.putString("name", this.name);
    nbt.putString("typeItem", this.type);
    nbt.setInteger("cost", this.cost);
    nbt.putString("rarity", this.rarity);

    //Оружия
    if (this.type === "weapon") {
        this.setNBTWeapon(nbt);
        //Оружия ближнего боя
        if (this.weaponRange === "melee") {
            this.setNBTMeleeWeapon(nbt);
        }
    }

    //Броня
    if (this.type === "armor") {
        this.setNBTArmor(nbt);
    }
};

// Инициализация предмета (установка всех свойств)
Item.prototype.giveItemPlayer = function () {
    this.setNBT();
    this.setLoreItem();
    this.player.giveItem(this.item);
}
