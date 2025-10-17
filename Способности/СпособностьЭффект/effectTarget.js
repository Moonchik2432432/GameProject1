function setEffectForTarget(effect, duration, target) {
    if (target) {
        target.addPotionEffect(effect, duration, 1, true)
    }
}