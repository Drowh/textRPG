const character = {
    name: "Арнольд",   // Имя персонажа, отображаемое на экране
    health: 100,        // Текущее здоровье персонажа
    maxHealth: 100,    // Максимальное здоровье, которое может быть у персонажа
    strength: 32,      // Сила, которая будет использоваться для атаки
    defense: 26,        // Защита, которая уменьшает урон от врагов
    level: 1,          // Текущий уровень персонажа, начинаем с 1
    experience: 0,    // Начальный опыт персонажа, который он будет зарабатывать в бою
    inventory: {
        "Зелье здоровья": 2,
        "Зелье силы": 2,
        "Зелье защиты": 2
    }    
};

function updateCharacterStats() {
    // Находим элементы в HTML, куда будем вставлять значения
    document.querySelector('.stats p:nth-child(1) span').textContent = character.name; // Имя персонажа
    document.querySelector('.health-bar .bar-fill').style.width = `${(character.health / character.maxHealth) * 100}%`; // Полоса здоровья
    document.querySelector('.health-bar .bar-text').textContent = `Здоровье: ${character.health}/${character.maxHealth}`; // Текст здоровья
    document.querySelector('.stats p:nth-child(4) span').textContent = character.strength; // Сила
    document.querySelector('.stats p:nth-child(5) span').textContent = character.defense; // Защита
    document.querySelector('.level-bar .bar-fill').style.width = `${(character.experience / (100 * character.level)) * 100}%`; // Полоса уровня
    document.querySelector('.level-bar .bar-text').textContent = `Уровень: ${character.level}`; // Уровень
}

// Обновляем интерфейс при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    updateCharacterStats();
    backgroundMusic.play();
});


// Враги          Запущу два слабых в лес, а сильного в данж) чтоб пройти в данж, нужно много убить в лесу слабых и поднять много уровней ))
const enemies = {
    dragon: {
        name: "dragon",
        health: 60,
        strength: 32,
        defense: 10,
        experience: 20 // Опыт за убийство
    },
    chimera: {
        name: "chimera",
        health: 80,
        strength: 40,
        defense: 20,
        experience: 30,
    },
    ouroboros: {
        name: "Уроборос",
        health: 200,
        strength: 60,
        defense: 40,
        experience: 50,
    },
}


// Функция для атаки врага
function attackEnemy(enemy) {
    // Урон, который наносит персонаж, с учётом защиты врага
    const damageToEnemy = Math.max(character.strength - enemy.defense, 0); // нулик чтоб не было отрицательного урона, если защиты больше чем силы
    enemy.health -= damageToEnemy;

    logAction(`Вы нанесли ${damageToEnemy} урона ${enemy.name}. У ${enemy.name} осталось ${enemy.health > 0 ? enemy.health : 0} здоровья.`);

    // Если здоровье врага опускается до 0 или ниже, он побеждён
    if (enemy.health <= 0) {
        logAction(`${enemy.name} побеждён!`);
        character.gainExperience(enemy.experience); // получение экспы пропишу ниже
    } else {
        // Если враг не побеждён, он наносит ответный удар
        counterAttack(enemy);
    }

    updateCharacterStats();
}


// Функция для ответного удара врага
function counterAttack(enemy) {
    const damageToCharacter = Math.max(enemy.strength - character.defense, 0);
    character.health -= damageToCharacter;

    logAction(`${enemy.name} наносит вам ${damageToCharacter} урона. У вас осталось ${character.health > 0 ? character.health : 0} здоровья.`);

    // Проверка, что здоровье персонажа не упало ниже 0
    if (character.health <= 0) {
        character.health = 0; // Устанавливаем здоровье в 0, если оно стало отрицательным
        logAction("Вы побеждены!");
        // Здесь можно добавить логику для окончания игры или перезапуска
    }

    updateCharacterStats();
}


// Обработчик для кнопки "Атаковать"
document.querySelector(".attack").addEventListener("click", () => {
    if (currentEnemy) {
        attackEnemy(currentEnemy);
    } else {
        logAction("Сначала выберите локацию с врагом.");
    }
});

// Обработчик для кнопки "Защищаться"
document.querySelector(".defend").addEventListener("click", () => {
    if (currentEnemy) {
        defend();
    } else {
        logAction("Сначала выберите локацию с врагом.");
    }
});

// Функция для защиты персонажа
function defend() {
    // Увеличиваем временно защиту на ход
    const defenseBoost = Math.floor(character.defense * 0.5); // Повышаем защиту на 50%
    character.defense += defenseBoost;

    logAction(`Вы усилили защиту на ${defenseBoost} на один ход.`);

    // Враг атакует, несмотря на защиту
    if (currentEnemy) {
        counterAttack(currentEnemy);
    }

    // Возвращаем защиту к норме после одного хода
    character.defense -= defenseBoost;
    updateCharacterStats();
}



// Журнал действий
function logAction(message) {
    // Находим элемент .log в HTML
    const logContainer = document.querySelector('.log');

    // Создаём новый элемент параграфа для записи в лог
    const newLogEntry = document.createElement('p');
    newLogEntry.textContent = message; // Устанавливаем текст новой записи

    // Добавляем новый параграф в logContainer
    logContainer.appendChild(newLogEntry);

    // Автоматически прокручиваем лог вниз, чтобы видеть последние действия
    logContainer.scrollTop = logContainer.scrollHeight;
}


// Переменная для хранения текущего врага
let currentEnemy = null;

// Функция смены локации
function changeLocation(location) {
    const gameContainer = document.querySelector('.game-container');
    const enemyIconElements = {
        dragon: document.querySelector('.dragon'),
        chimera: document.querySelector('.chimera'),
        ouroboros: document.querySelector('.ouroboros')
    };

    // Скрываем все иконки врагов
    Object.values(enemyIconElements).forEach(icon => icon.style.display = 'none');

    // Определяем действия в зависимости от локации
    if (location === 'village') {
        gameContainer.style.backgroundImage = 'url(./img/village.jpg)';
        logAction("Вы находитесь в деревне. Здесь безопасно.");
        currentEnemy = null; // Нет врагов в деревне
    } else if (location === 'forest') {
        gameContainer.style.backgroundImage = 'url(./img/forest.jpg)';
        logAction("Вы вошли в лес. На вас напал враг!");
        
        // Выбираем случайного врага в лесу (Дракон или Химера)
        currentEnemy = Math.random() < 0.5 ? enemies.dragon : enemies.chimera;
        logAction(`На вас напал ${currentEnemy.name}!`);

        // Показываем иконку соответствующего врага
        enemyIconElements[currentEnemy.name.toLowerCase()].style.display = 'block';
        attackEnemy(currentEnemy);
    } else if (location === 'dungeon') {
        gameContainer.style.backgroundImage = 'url(./img/dungeon.jpg)';
        logAction("Вы вошли в подземелье. На вас напал враг!");

        // В подземелье всегда Уроборос
        currentEnemy = enemies.ouroboros;
        logAction(`На вас напал ${currentEnemy.name}!`);

        // Показываем иконку Уробороса
        enemyIconElements[currentEnemy.name.toLowerCase()].style.display = 'block';
        attackEnemy(currentEnemy);
    }
}


// АУДИО
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');


let currentTrack = 1; // Переменная для отслеживания текущего трека

// Функция для переключения треков
function switchTrack() {
    currentTrack = currentTrack === 1 ? 2 : 1; // Меняем трек
    document.getElementById('background-music').src = currentTrack === 1 ? './songs/Adventure.mp3' : './songs/Tam.mp3';
    backgroundMusic.load(); // Перезагружаем аудио
    backgroundMusic.play(); // Воспроизводим следующий трек
}

// Обработчик события окончания трека
backgroundMusic.addEventListener('ended', switchTrack);


musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicIcon.src = './icons/volume.svg'; 
    } else {
        backgroundMusic.pause();
        musicIcon.src = './icons/mute.svg'; 
    }
});








