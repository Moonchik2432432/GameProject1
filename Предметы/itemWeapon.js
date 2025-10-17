
//Подкласс оружия из класс предметов
function Weapon(id, player, name, type, lore, cost, rarity, damage, speedAttack, typeDamage, reqStrength, reqAgility, weaponRange, mainCharacteristics) {
    Item.call(this, id, player, name, type, lore, cost, rarity)
    this.damage = damage;
    this.speedAttack = speedAttack;
    this.typeDamage = typeDamage;
    this.reqStrength = reqStrength;
    this.reqAgility = reqAgility;
    this.weaponRange = weaponRange;
    this.mainCharacteristics = mainCharacteristics;
}

Weapon.prototype = Object.create(Item.prototype);
Weapon.prototype.constructor = Weapon;

//Статы для оружия
Weapon.prototype.setWeaponStats = function () {
    this.item.setAttribute("generic.attack_damage", this.damage, 0);
    this.item.setAttribute("generic.attack_speed", this.speedAttack, 0);
}

//Дополнительный лор для оружия
Weapon.prototype.setLoreWeapon = function (lore, space, line) {
    lore.push("§7Тип урона: " + translateWord(this.typeDamage))

    if (this.weaponRange === "melee") this.setLoreMeleeWeapon(lore, "holdType");

    lore.push(space, line, space,
        "§7Урон: §c" + this.damage,
        "§7Скорость атаки: " + this.getBarLore(-3.2, -1.6, this.speedAttack)
    )
    if (this.weaponRange === "melee") this.setLoreMeleeWeapon(lore, "meleeRange");

    if (this.reqStrength > 0 || this.reqAgility > 0) {
        lore.push(space, line, space)
        if (this.reqStrength > 0) lore.push("§7Требуеться сила: §5" + this.reqStrength);
        if (this.reqAgility > 0) lore.push("§7Требуеться ловкость: §5" + this.reqAgility);
    }
}

//Нбт для оружия
Weapon.prototype.setNBTWeapon = function (nbt) {
    this.setWeaponStats();
    nbt.setInteger("damage", this.damage);
    nbt.setFloat("speedAttack", this.speedAttack);
    nbt.putString("typeDamage", this.typeDamage);
    nbt.setInteger("reqStrength", this.reqStrength);
    nbt.setInteger("reqAgility", this.reqAgility);
    nbt.putString("weaponRange", this.weaponRange);
    nbt.putString("mainCharacteristics", this.mainCharacteristics);
}

//Звезды для скорости атаки (лор)
Weapon.prototype.getBarLore = function (min, max, element) {
    var value = Math.max(min, Math.min(max, element))
    var totalBars = 5;
    var filledBars = Math.round(((value - min) / (max - min)) * totalBars)

    var stars = "";
    for (var i = 0; i < totalBars; i++) {
        stars += (i < filledBars) ? "§e✦" : "§7✧";
    }
    return stars;
}

//Подкласс ближнего оружия из класс оружия

function MeleeWeapon(id, player, name, type, lore, cost, rarity, damage, speedAttack, typeDamage, reqStrength, reqAgility, weaponRange, mainCharacteristics, typeWeaponMelee, holdType, meleeRange) {
    Weapon.call(this, id, player, name, type, lore, cost, rarity, damage, speedAttack, typeDamage, reqStrength, reqAgility, weaponRange, mainCharacteristics)
    this.typeWeaponMelee = typeWeaponMelee;
    this.holdType = holdType;
    this.meleeRange = meleeRange;
}

MeleeWeapon.prototype = Object.create(Weapon.prototype);
MeleeWeapon.prototype.constructor = MeleeWeapon;

//Лор для ближнего оружия
MeleeWeapon.prototype.setLoreMeleeWeapon = function (lore, type) {
    if (type === "holdType") lore.push("§7Тип хвата: §b" + translateWord(this.holdType));
    if (type === "meleeRange") lore.push("§7Дальность атаки: §b" + this.getBarLore(2.0, 3.0, this.meleeRange));
}

//Нбт для ближнего оружия
MeleeWeapon.prototype.setNBTMeleeWeapon = function (nbt) {
    nbt.putString("holdType", this.holdType);
    nbt.setFloat("meleeRange", this.meleeRange);
    nbt.putString("weapon_attributes", '{"parent":"bettercombat:' + this.typeWeaponMelee + '"}');
}

//Подкласс дальнего оружия из класс оружия

function RangedWeapon(id, player, name, type, lore, cost, rarity, damage, speedAttack, typeDamage, reqStrength, reqAgility, weaponRange, mainCharacteristics, speedProjectile, reloadTime) {
    Weapon.call(this, id, player, name, type, lore, cost, rarity, damage, speedAttack, typeDamage, reqStrength, reqAgility, weaponRange, mainCharacteristics)
    this.speedProjectile = speedProjectile;
    this.reloadTime = reloadTime;
}

RangedWeapon.prototype = Object.create(Weapon.prototype);
RangedWeapon.prototype.constructor = RangedWeapon;


// Функция инициализации (например, вызов из события)
function init(e) {
    itemRpg = new MeleeWeapon(
        "weapon_adventure:swordsnakewhisper", // ID предмета
        e.player,// Игрок
        "Змеевик", // Название
        "weapon", // Тип Weapon/Armor/Consumables/Material/Keyitem/Document
        "Змеиный меч отравляющий врагов", // Описание, разделённое 
        6700, // Стоимость
        "royal",  // Редкость

        //Оружия
        20, // Урон
        -2.4, // Скорость атаки [-3.2, -2.8, -2.4, -2.0, -1.6]
        "elemental", // Тип урона
        0, //сила
        0, //ловкость
        "melee", //Ближнее или дальнее
        "strength",

        //Ближнее оружия
        "sword", //тип оружия для анимаций
        "one-handed", //Тип хвата
        2.65 //Дальность ближней атаки

        // //Дальнее оружия
        // 4,
        // 4

    );

    itemRpg.giveItemPlayer();
}

