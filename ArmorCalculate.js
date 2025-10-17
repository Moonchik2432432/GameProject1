var armorPoints = 0;
var fullSetMatched = null;

var allArmor = {
    leatherArmor: {
        boots: { name: "Кожаные ботинки", points: 1 },
        legs: { name: "Кожаные штаны", points: 1 },
        body: { name: "Кожаная куртка", points: 1 },
        helmet: { name: "Кожаный шлем", points: 1 }
        // 4% процентов
    },
    diamondArmor: {
        boots: { name: "Алмазные ботинки", points: 10 },
        legs: { name: "Алмазные поножи", points: 25 },
        body: { name: "Алмазный нагрудник", points: 35 },
        helmet: { name: "Алмазный шлем", points: 10 },
        fullArmorBonusTick: function (e) {
            e.player.addPotionEffect(12, 2, 0, false);
        },
        fullArmorBonusOnce: function (e) {
            e.player.message("Меня ударили")
        }
        // 80% процентов
    },
    ironArmor: {
        boots: { name: "Железные ботинки", points: 5 },
        legs: { name: "Железные поножи", points: 15 },
        body: { name: "Железный нагрудник", points: 25 },
        helmet: { name: "Железный шлем", points: 5 }
    }
};

function tick(e) {
    var player = e.player;
    var hasArmor = false

    //Проверяет элементы брони
    for (var i = 0; i < 4; i++) {
        var armor = player.getArmor(i);
        if (armor && armor.getName() != "air") {
            hasArmor = true;
            break;
        }
    }
    //Если хоть какая-та брони есть, то каждую секунду запускает функцию
    if (hasArmor) {
        checkArmorSet(e);
    }
}

function checkArmorSet(e) {
    var player = e.player
    // слотов брони
    var armorGetArray = [
        player.getArmor(0).getDisplayName(), // boots
        player.getArmor(1).getDisplayName(), // legs
        player.getArmor(2).getDisplayName(), // body
        player.getArmor(3).getDisplayName(), // helmet
    ]

    fullSetMatched = null
    armorPoints = 0

    // категорий брони
    for (var armorType in allArmor) {
        var matchedParts = 0
        var armorCategory = allArmor[armorType]
        // вид брони
        for (var part in armorCategory) {
            if (part == 'fullArmorBonusTick' || part == 'fullArmorBonusOnce') continue;
            var armorItem = armorCategory[part]
            // Надета броня
            for (var i = 0; i < armorGetArray.length; i++) {
                if (armorGetArray[i] == armorItem.name) {
                    armorPoints += armorItem.points;
                    matchedParts++
                }
            }
            if (matchedParts == 4) {
                fullSetMatched = armorCategory
                break;
            }
        }
    }
    //Если есть фулл броня 
    if (fullSetMatched && typeof fullSetMatched.fullArmorBonusTick === "function") {
        fullSetMatched.fullArmorBonusTick(e);
    }
}

function damaged(e) {
    var baseDamage = e.damage;
    if (fullSetMatched && typeof fullSetMatched.fullArmorBonusOnce === "function") {
        fullSetMatched.fullArmorBonusOnce(e)
    }
    calculateDamage(armorPoints, baseDamage, e)
}
//Разчитивает урон
function calculateDamage(armorPoints, baseDamage, e) {
    var reduction = Math.min(armorPoints, 100) / 100;

    var finalDamage = baseDamage * (1 - reduction);
    e.damage = finalDamage;
}
