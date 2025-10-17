///Набор скриптов для улучшенного боя НПС (2023 rework)

// Нанесение урона по области вокруг нпс
var radius = 6; // Радиус атаки
var damage = 5; // Урон атаки (Этот скрипт дамажит через защиту)

var time = 5; // Время действия эффекта горения/зелий
var power = 0; // Сила эффекта зелий (0 = 1 уровень)
var effectID = 15; // Айди эффекта зелий

var entityType = 1; // Тип существа, 2 = только нпс, 1 = только игроки, -1 = все энтити в игре(даже снаряды)

function interact(e) {
    var ne = e.npc.world.getNearbyEntities(e.npc.pos, radius, entityType); // Проверяет существ вокруг нпс
    for (var i = 0; i < ne.length; i++) { // Это лучше не трогать если оно используется в этом случае
        if (ne[i] != e.npc) { // Позволяет нпс не дамажить самого себя если будете редачить скрипт
            //строчка выше бесполезна если скрипт работает только на игроков
            ne[i].damage(damage); // Нанесение урона
            ne[i].setBurning(time); // Поджигание
            ne[i].addPotionEffect(effectID, time, power, 0); // Нанесение эффекта зелий
        }
    }
}
//------------------------------------------------------------------------------
//Призыв приспешников на определённых координатах либо рядом относительно нпс
//Если вы хотите призвать относительно нпс то пишем к примеру
//e.npc.world.spawnClone(e.npc.getX()+2, e.npc.getY(), e.npc.getZ(), cloneTab, cloneName)
//Таким образом будет спавнить относительно нпс

//Чтобы нпс работал нужно сохранить его клонером в серверную часть и в ту вкладку которая в скрипте
var cloneName = "???";
var cloneTab = 1;

function interact(e) {
    e.npc.world.spawnClone(x, y, z, cloneTab, cloneName);
    e.npc.world.spawnClone(x, y, z + 2, cloneTab, cloneName);
}
//------------------------------------------------------------------------------
// Телепортация нпс 
var soundTP = "???"; // Звук телепортации
var soundVolume = 1; // Громкость звука телепортации
var soundSpeed = 1; // Скорость воспроизведения звука

var particleEffect = "cloud"; // Какие именно частицы появляются
var particlePower = 0.2; // Как далеко разлетаются частицы, их сила
var particles = 20; // Количество частиц, лучше много не ставить.

function interact(e) {
    e.npc.world.playSoundAt(e.npc.pos, soundTP, soundVolume, soundSpeed);
    e.npc.world.spawnParticle(particleEffect, e.npc.getX(), e.npc.getY(), e.npc.getZ(), 0.2, 2, 0.2, particlePower, particles);
    e.npc.setPosition(x, y, z);
    e.npc.world.playSoundAt(e.npc.pos, soundTP, soundVolume, soundSpeed);
    e.npc.world.spawnParticle(particleEffect, e.npc.getX(), e.npc.getY(), e.npc.getZ(), 0.2, 2, 0.2, particlePower, particles);
}

//------------------------------------------------------------------------------
// Исцеление нпс на 15% 
var percent = 15;

function interact(e) {
    e.npc.setHealth(e.npc.getHealth() + e.npc.getMaxHealth() * (percent / 100));
    // Текущее здоровье + Максимальное здоровье умноженное на 15/100
}

//------------------------------------------------------------------------------
//Временное ускорение нпс по суше 
//Существует 2 варианта
// 1)
function interact(e) {
    e.npc.addPotionEffect(1, 10, 1, 0);
    //Скорость на 10 секунд второго уровня.
}
// 2)
function interact(e) {
    e.npc.getTimers().forceStart(1, 100, false); // Запускает таймер на 5 секунд
    e.npc.getAi().setWalkingSpeed(7); // В течение 5 секунд скорость повышена
}
function timer(e) {
    if (e.id == 1) {
        e.npc.getAi().setWalkingSpeed(5); // Сбрасывает скорость обратно по истечению таймера
    }
}

//------------------------------------------------------------------------------
//Временная неуязвимость нпс, такой же принцип как с ускорением
// 1)
function interact(e) {
    e.npc.addPotionEffect(11, 10, 7, 0);
    //Сопротивление к урону на 10 секунд восьмого уровня.
}
// 2)
function interact(e) {
    e.npc.getTimers().forceStart(1, 100, false); // Запускает таймер на 5 секунд
    e.npc.getStats().setResistance(0, 2.0);
    e.npc.getStats().setResistance(1, 2.0); // В течение 5 секунд сопротивление к урону максимально
}
function timer(e) {
    if (e.id == 1) {
        e.npc.getStats().setResistance(0, 1.0);
        e.npc.getStats().setResistance(1, 1.0); // Сбрасывает сопротивение до нуля по истечению таймера
    }
}

//------------------------------------------------------------------------------
// Рывок нпс вперёд, если хотите чтобы он не прыгал вверх, то удалите строку с крестиком, она отвечает за направление по Y
function interact(e) { // Спасибо @sigaisha за этот фрагмент
    var rotation = e.npc.rotation + 90;
    var power = 1;
    e.npc.motionX += power * cos(rotation);
    e.npc.motionY += 2; // XXX
    e.npc.motionZ += power * sin(rotation);
}

//------------------------------------------------------------------------------
//Шанс блокировки удара со звуком
var soundID = "???"; // Звук блока удара
var soundVolume = 1; // Громкость звука
var soundSpeed = 1; // Скорость воспроизведения звука

var blockChance = 20; //Шанс блокировать атаку

function damaged(e) {
    if (Math.random() <= (blockChance / 100)) {
        e.setCanceled(true);
        e.npc.world.playSoundAt(e.npc.pos, soundID, soundVolume, soundSpeed);
    }
}

//------------------------------------------------------------------------------
//Переход с первой фазы на вторую
var phaseChangeMessage = "Я стал сильнее!" //Фраза НПС при смене фазы

var soundID = "???"; // Звук смены фазы
var soundVolume = 1; // Громкость звука
var soundSpeed = 1; // Скорость воспроизведения звука

var particleEffect = "flame"; // Какие именно частицы появляются
var particlePower = 0.2; // Как далеко разлетаются частицы, их сила
var particles = 20; // Количество частиц, лучше много не ставить

var phase = 1; //С какой фазы начинается бой
function damaged(e) {

    if (phase == 1 && e.npc.getHealth() <= e.npc.getMaxHealth() / 2) {
        phase = 2;
        e.npc.say(phaseChangeMessage);
        e.npc.world.spawnParticle(particleEffect, e.npc.getX(), e.npc.getY(), e.npc.getZ(), 0, 0, 0, particlePower, particles);
        e.npc.world.playSoundAt(e.npc.pos, soundID, soundVolume, soundSpeed);
    }

}

//------------------------------------------------------------------------------
//Каждые третий удар НПС наносит с увеличенной силой
var onepunchCount = 3; //Сколько требуется для сильного удара
var onepunchDMG = 999999; //Сколько урона наносит нпс при сильном ударе

var count = 0; //С какого счёта начинает драку
function meleeAttack(e) {
    count += 1;
    if (count >= onepunchCount) {
        e.damage = onepunchDMG;
        count = 0;
    }
}

//------------------------------------------------------------------------------
//НПС не может получить урон выше конкретного числа
var fixDamage = 5; //Число выше которого урон будет равняться этому числу

function damaged(e) {
    if (e.damage > fixDamage)
        e.damage = fixDamage;
}

//------------------------------------------------------------------------------
//НПС подкидывает игрока вверх при атаке
var power = 1; //Сила подкидывания

var object;
function meleeAttack(e) {
    object = e.target;
    e.npc.timers.forceStart(1, 0, false);
}

function timer(e) {
    if (e.id == 1) {
        object.motionY = power;
    }
}
/*
Таймер используется в скрипте потому что игра не позволяет запустить движение поверх движения толчка от получаемого урона,
из-за чего единственным вариантом остаётся запустить это движение немного позже основного толчка от удара.

Условно, был совершён удар и спустя 0.5 тика игрока подкидывает вверх. Визуально при игре никак не замечается.
*/
//------------------------------------------------------------------------------

/*
90% всех скриптов в списке предназначены для обучения скриптингу в качестве примера.
Не удивляйтесь, если скрипт не работает так как хотелось бы без редактирования.
Не удивляйтесь, если скрипт нужно переписать под вас.
Не удивляйтесь, если после собственноручного редактирования вышло всё равно как-то не так.
Не удивляйтесь, если скрипт в целом не работает на вашей версии (1.7.10/1.6.4).

Всё предназначено для обучения на версии 1.12.2 и выше.
Вполне можно использовать в качестве дополнения в вашем проекте любой из фрагментов.
Однако, подобные вещи могут нуждаться в редактировании или дополнении кода.

https://vk.com/scn_scripting_custom_npc - здесь вы можете заказать новый код или отредактировать старый.
https://learn.javascript.ru - здесь вы можете обучиться основам скриптинга самостоятельно.
*/