function calcDamage(ability, damage) {
    return Math.round(damage + ability * 1.2 + (Math.pow(ability, 2)) / 20);
}
