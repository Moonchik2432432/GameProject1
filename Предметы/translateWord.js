function translateWord(word) {
    switch (word.toLowerCase()) {
        //Type
        case "weapon": return "оружия";
        case "armor": return "броня";
        case "consumables": return "расходуемый предмет";
        case "material": return "материал";
        case "keyitem": return "ключевой предмет";
        case "document": return "документ";

        //rarity
        case "common": return "обычный";
        case "soldier": return "солдатский";
        case "veteran": return "ветеранский";
        case "royal": return "королевский";
        case "divine": return "божественный";

        //Weapon
        //typeWeapon
        case "chopping": return "режущий";
        case "crushing": return "дробящий";
        case "piercing": return "колющий";
        case "elemental": return "элементальный";
        case "magical": return "магический";

        //holdType
        case "one-handed": return "одноручный";
        case "two-handed": return "двуручный";

        //ArmorType
        case "helmet": return "шлем";
        case "chestplate": return "нагрудник";
        case "leggings": return "штаны";
        case "boots": return "ботинки";

        default: return word;
    }
}