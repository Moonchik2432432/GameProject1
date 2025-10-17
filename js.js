var pyrolizard = {
    defaultDamage: 1,
};

var animationTermitHit = [
    "animation.termit.hit",
    "animation.termit.hit1"
];

function init(e) {
    deathAnimation = false; // Указываем, что НПС жив
    e.npc.display.setVisible(0); // Делаем НПС видимым
    e.npc.ai.setWalkingSpeed(5);
    e.npc.updateClient();
}

function meleeAttack(e) {
    e.setCanceled(true); // Отменяем ванильный удар

    if (deathAnimation) return; // Если НПС в анимации смерти, не атакуем

    threadrun(function () {
        playAnim(animationTermitHit[Math.floor(Math.random() * animationTermitHit.length)], e.npc); // Запускаем стандартную анимацию удара
        thread.sleep(750);

        if (e.target) {
            e.target.damage(pyrolizard.defaultDamage); // Наносим урон
        }

        e.npc.world.playSoundAt(e.npc.pos, "minecraft:entity.player.attack.sweep", 0.5, 0.8 + Math.random() * 0.2);
    });
}

// При получении урона
function damaged(e) {
    if (deathAnimation && e.damage < 999) {
        e.setCanceled(true); // Не получаем урон во время смерти
        return;
    }

    if (e.damage >= e.npc.getHealth() && !deathAnimation) {
        e.setCanceled(true); // Блокируем мгновенную смерть
        e.npc.ai.setWalkingSpeed(0);  // Останавливаем НПС
        playAnim("animation.termit.death", e.npc); // Запускаем анимацию смерти

        threadrun(function () {
            deathAnimation = true // переменная истина
            e.npc.world.playSoundAt(e.npc.pos, "minecraft:entity.spider.hurt", 0.5, 1);
           thread.sleep(900); // Ждем завершения анимации
            e.npc.display.setVisible(1); // делает невидимым
            e.npc.world.spawnParticle("lava", e.npc.x, e.npc.y + 0.7, e.npc.z, 0, 0, 0, 0.2, 50);
            e.npc.updateClient();
            e.npc.damage(9999); // Фатальный урон
        });
    }
}

// При смерти НПС
function died(e) {
    deathAnimation = false // переменная ложь
}
var deathAnimation = false // создаються переменная

function playAnim(anim, npc) {
    var builder = api.createAnimBuilder(); // Создаем анимацию
    builder.playOnce(anim); // Добавляем анимацию
    npc.syncAnimationsForAll(builder); // Синхронизируем анимацию для всех игроков
}

var thread = java.lang.Thread;
function threadrun(runnable) {
    var addThread = Java.extend(thread, {
        run: runnable
    });
    try {
        var H = new addThread();
        H.start();
    } catch (err) {
        print(err);
    }
}

