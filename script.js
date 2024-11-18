const character = {
    name: "Арнольд",
    health: 100,
    maxHealth: 100,
    strength: 32,
    defense: 26,
    level: 1,
    experience: 0,
    experienceToLevelUp: 100, // Порог опыта для повышения уровня
    inventory: {
        "Зелье здоровья": 2,
        "Зелье силы": 2,
        "Зелье защиты": 2
    },

    // Метод для получения опыта
    gainExperience(amount) {
        this.experience += amount;
        logAction(`Вы получили ${amount} опыта.`);

        // Проверка на повышение уровня
        while (this.experience >= this.experienceToLevelUp) {
            this.levelUp();
        }

        updateCharacterStats(); // Обновляем характеристики персонажа на экране
    },

    // Метод для повышения уровня
    levelUp() {
        this.level += 1;
        this.experience -= this.experienceToLevelUp;
        this.experienceToLevelUp = Math.floor(this.experienceToLevelUp * 1.2); // Увеличиваем порог опыта на 20%

        // Увеличиваем характеристики при повышении уровня
        this.maxHealth += 20;
        this.strength += 5;
        this.defense += 3;
        this.health = this.maxHealth; // Полностью восстанавливаем здоровье

        logAction(`Поздравляем! Вы достигли ${this.level} уровня! Ваши характеристики увеличились.`);
    }
};


function updateCharacterStats() {
    // Находим элементы в HTML, куда будем вставлять значения
    document.querySelector('.stats p:nth-child(1) span').textContent = character.name; // Имя персонажа
    document.querySelector('.health-bar .bar-fill').style.width = `${(character.health / character.maxHealth) * 100}%`; // Полоса здоровья
    document.querySelector('.health-bar .bar-text').textContent = `Здоровье: ${character.health}/${character.maxHealth}`; // Текст здоровья
    document.querySelector('.stats p:nth-child(4) span').textContent = character.strength; // Сила
    document.querySelector('.stats p:nth-child(5) span').textContent = character.defense; // Защита

    // Полоса опыта для текущего уровня
    const experiencePercentage = (character.experience / character.experienceToLevelUp) * 100;
    document.querySelector('.level-bar .bar-fill').style.width = `${experiencePercentage}%`;
    document.querySelector('.level-bar .bar-text').textContent = `Уровень: ${character.level}`;

    
}

// Обновляем интерфейс при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    updateCharacterStats();
    backgroundMusic.play();
    updateInventoryUI();
});


// Враги        Запущу два слабых в лес, а сильного в данж) чтоб пройти в данж, нужно много убить в лесу слабых и поднять много уровней ))
const enemies = {
    dragon: {
        name: "dragon",
        health: 60,
        maxHealth: 60,
        strength: 32,
        defense: 10,
        experience: 40 // Опыт за убийство
    },
    chimera: {
        name: "chimera",
        health: 80,
        maxHealth: 80,
        strength: 40,
        defense: 20,
        experience: 50,
    },
    ouroboros: {
        name: "ouroboros",
        health: 200,
        maxHealth: 200,
        strength: 60,
        defense: 40,
        experience: 60,
    },
}

// Обновление полосы здоровья врага
function updateEnemyHealthBar(enemy) {
    const enemyHealthBar = document.querySelector('.enemy-health-bar');
    const barFill = enemyHealthBar.querySelector('.bar-fill');
    const barText = enemyHealthBar.querySelector('.bar-text');

    if (enemyHealthBar && barFill && barText) {
        enemyHealthBar.style.display = 'block'; // Показываем полосу здоровья врага
        const healthPercentage = Math.max((enemy.health / enemy.maxHealth) * 100, 0); // Расчёт процента здоровья
        barFill.style.width = `${healthPercentage}%`;
        barText.textContent = `Здоровье: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`;
    }
}

// Скрытие полосы здоровья врага (например, после победы)
function hideEnemyHealthBar() {
    const enemyHealthBar = document.querySelector('.enemy-health-bar');
    if (enemyHealthBar) {
        enemyHealthBar.style.display = 'none';
    }
}


// Функция для атаки врага
function attackEnemy(enemy) {
    // Урон, который наносит персонаж, с учётом защиты врага
    const damageToEnemy = Math.max(character.strength - enemy.defense, 0); 
    enemy.health -= damageToEnemy;

    logAction(`Вы нанесли ${damageToEnemy} урона ${enemy.name}. У ${enemy.name} осталось ${enemy.health > 0 ? enemy.health : 0} здоровья.`);
    updateEnemyHealthBar(enemy); // Обновляем здоровье врага

    // Если здоровье врага опускается до 0 или ниже, он побеждён
    if (enemy.health <= 0) {
        logAction(`${enemy.name} побеждён!`);
        character.gainExperience(enemy.experience); // Получаем опыт за победу

        // Сброс врага после победы
        currentEnemy = null; // Очищаем текущего врага
        enemy.health = 0; // Устанавливаем здоровье врага в 0, чтобы не допустить повторных атак
        hideEnemyHealthBar(); // Скрываем полосу здоровья врага
        // Скрываем иконку врага
        const enemyIcon = document.querySelector(`.${enemy.name.toLowerCase()}`);
        if (enemyIcon) {
            enemyIcon.style.display = 'none';
        }

        // Выводим сообщение о завершении боя
        logAction(`Вы победили ${enemy.name}. Можете вернуться в деревню для отдыха или перезапустить локацию.`);
    } else {
        // Если враг не побеждён, он наносит ответный удар
        counterAttack(enemy);
    }

    updateEffects();
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
        showGameOverModal(); // Показываем окно "Вы проиграли"
    }

    updateEffects();
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

// Отображение количества зелий в интерфейсе
function updateInventoryUI() {
    const inventoryContainer = document.querySelector('.inventory');

    // Очищаем инвентарь от предыдущих элементов
    inventoryContainer.classList.toggle('empty', Object.keys(character.inventory).length === 0);

    // Находим все элементы инвентаря и обновляем их
    document.querySelectorAll('.inventory .item').forEach(item => {
        const itemName = item.querySelector('.potion').textContent.trim(); // Название предмета
        const itemCount = character.inventory[itemName] || 0; // Количество предметов или 0, если его нет

        // Если количество 0, удаляем элемент из интерфейса
        if (itemCount === 0) {
            item.remove();
        } else {
            // Удаляем старый счётчик и добавляем новый с актуальным количеством
            let countElement = item.querySelector('.count');
            if (!countElement) {
                countElement = document.createElement('div');
                countElement.className = 'count';
                item.appendChild(countElement);
            }
            countElement.textContent = itemCount; // Устанавливаем количество предметов
        }
    });
}

// Обработчик для кнопки "Использовать предмет"
document.querySelector(".use-item").addEventListener("click", () => {
    if (currentEnemy) { // Проверка, что враг существует
        document.querySelectorAll('.inventory .item').forEach(item => {
            item.classList.add("highlight"); // Подсвечиваем все предметы
            item.addEventListener("click", handleItemClick);
        });
    } else {
        logAction("Вы можете использовать зелье только в бою.");
    }
});

// Функция обработки использования предмета
function handleItemClick(event) {
    const itemName = event.currentTarget.querySelector('.potion').textContent.trim();

    // Применяем эффект предмета
    if (character.inventory[itemName] > 0) {
        useItem(itemName);
    }

    // Снимаем подсветку и обработчик после использования
    document.querySelectorAll('.inventory .item').forEach(item => {
        item.classList.remove("highlight");
        item.removeEventListener("click", handleItemClick);
    });
}

// Логика применения предмета
function useItem(itemName) {
    // Проверяем, есть ли зелье и количество больше 0
    if (character.inventory[itemName] > 0 && !itemCooldowns[itemName]) {
        character.inventory[itemName] -= 1; // Уменьшаем количество зелья на 1

        // Применяем эффект зелья и запускаем баф
        applyItemEffect(itemName);

        // Проверяем, если количество зелья стало 0, удаляем из инвентаря
        if (character.inventory[itemName] === 0) {
            delete character.inventory[itemName]; // Удаляем зелье из объекта инвентаря
        }

        updateInventoryUI(); // Обновляем инвентарь
        updateCharacterStats(); // Обновляем параметры персонажа
    } else if (itemCooldowns[itemName]) {
        logAction(`Зелье "${itemName}" можно использовать только через ${itemCooldowns[itemName]} хода.`);
    } else {
        logAction("У вас нет такого предмета.");
    }
}

// Переменная для отслеживания активных эффектов и задержки на использование
const activeEffects = {}; // Хранит бафы от зелий
const itemCooldowns = {}; // Хранит задержку на использование предметов

// Функция применения эффекта предмета
function applyItemEffect(itemName) {
    // Устанавливаем задержку на повторное использование предмета
    itemCooldowns[itemName] = 2; // Задержка на 2 хода

    switch (itemName) {
        case 'Зелье здоровья':
            character.health = Math.min(character.health + 50, character.maxHealth);
            logAction("Вы использовали Зелье здоровья и восстановили 50 здоровья.");
            activeEffects['Зелье здоровья'] = 2; // Баф на 2 хода
            break;
        case 'Зелье силы':
            character.strength += 10;
            logAction("Вы использовали Зелье силы. Ваша сила увеличена на 10 на 2 хода.");
            activeEffects['Зелье силы'] = 2;
            break;
        case 'Зелье защиты':
            character.defense += 10;
            logAction("Вы использовали Зелье защиты. Ваша защита увеличена на 10 на 2 хода.");
            activeEffects['Зелье защиты'] = 2;
            break;
    }

    updateInventoryUI();
    updateCharacterStats();
}

// Функция для обновления бафов и задержки перед каждым ходом
function updateEffects() {
    // Уменьшаем счетчик ходов для каждого бафа и снимаем баф, если он истёк
    for (const effect in activeEffects) {
        if (activeEffects[effect] > 0) {
            activeEffects[effect] -= 1;
            if (activeEffects[effect] === 0) {
                removeItemEffect(effect);
            }
        }
    }

    // Обновляем задержки на использование предметов
    for (const item in itemCooldowns) {
        if (itemCooldowns[item] > 0) {
            itemCooldowns[item] -= 1;
        }
    }
}

// Функция для снятия эффекта предмета после завершения действия бафа
function removeItemEffect(itemName) {
    switch (itemName) {
        case 'Зелье силы':
            character.strength -= 10; // Снимаем увеличение силы
            logAction("Эффект Зелья силы закончился.");
            break;
        case 'Зелье защиты':
            character.defense -= 10; // Снимаем увеличение защиты
            logAction("Эффект Зелья защиты закончился.");
            break;
        // Зелье здоровья не требует обратного действия
    }
    updateCharacterStats();
}




// Переменная для хранения текущего врага
let currentEnemy = null;

// Функция смены локации
function changeLocation(location) {
    const gameContainer = document.querySelector('.game-container');
    const locationNameSpan = document.querySelector('.location-name'); // Находим span для названия локации
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
        locationNameSpan.textContent = "Деревня"; // Обновляем название локации
        logAction("Вы находитесь в деревне. Здесь безопасно.");
        currentEnemy = null; // Нет врагов в деревне
        hideEnemyHealthBar(); // Убираем полоску здоровья врага
    } else if (location === 'forest') {
        gameContainer.style.backgroundImage = 'url(./img/forest.jpg)';
        locationNameSpan.textContent = "Лес"; // Обновляем название локации
        logAction("Вы вошли в лес. На вас напал враг!");

        // Выбираем случайного врага в лесу (Дракон или Химера) и восстанавливаем его здоровье
        currentEnemy = Math.random() < 0.5 ? enemies.dragon : enemies.chimera;
        currentEnemy.health = currentEnemy.maxHealth; // Восстанавливаем здоровье врага
        updateEnemyHealthBar(currentEnemy); // Обновляем полосу здоровья врага
        logAction(`На вас напал ${currentEnemy.name}!`);

        // Показываем иконку соответствующего врага
        enemyIconElements[currentEnemy.name].style.display = 'block';
        attackEnemy(currentEnemy);
    } else if (location === 'dungeon') {
        gameContainer.style.backgroundImage = 'url(./img/dungeon.jpg)';
        locationNameSpan.textContent = "Подземелье"; // Обновляем название локации
        logAction("Вы вошли в подземелье. На вас напал враг!");

        // В подземелье всегда Уроборос, восстанавливаем его здоровье
        currentEnemy = enemies.ouroboros;
        currentEnemy.health = currentEnemy.maxHealth; // Восстанавливаем здоровье врага
        updateEnemyHealthBar(currentEnemy); // Обновляем полосу здоровья врага
        logAction(`На вас напал ${currentEnemy.name}!`);

        // Показываем иконку Уробороса
        enemyIconElements[currentEnemy.name].style.display = 'block';
        attackEnemy(currentEnemy);
    }
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



// Показываем окно "Вы проиграли"
function showGameOverModal() {
    const gameOverModal = document.querySelector('.game-over-modal');
    gameOverModal.style.display = 'flex';

    // Добавляем обработчик для кнопки перезапуска
    const restartButton = document.querySelector('.restart-button');
    restartButton.addEventListener('click', restartGame);
}

// Сбрасываем параметры игры
function restartGame() {
    // Сбрасываем характеристики персонажа
    character.health = 100;
    character.maxHealth = 100;
    character.strength = 32;
    character.defense = 26;
    character.level = 1;
    character.experience = 0;
    character.experienceToLevelUp = 100;
    character.inventory = {
        "Зелье здоровья": 2,
        "Зелье силы": 2,
        "Зелье защиты": 2
    };

    // Убираем модальное окно
    const gameOverModal = document.querySelector('.game-over-modal');
    gameOverModal.style.display = 'none';

    // Сбрасываем врагов
    currentEnemy = null;

    // Сбрасываем интерфейс
    updateCharacterStats();
    updateInventoryUI();
    hideEnemyHealthBar();

    // Сбрасываем лог и возвращаем персонажа в деревню
    const logContainer = document.querySelector('.log');
    logContainer.innerHTML = '<p>Игра началась заново.</p>';
    changeLocation('village');
}


// Обработчик для кнопки "Рестарт игры"
document.querySelector(".reset-button").addEventListener("click", () => {
    // Показываем окно подтверждения перед перезагрузкой игры
    const confirmRestart = confirm("Вы точно хотите перезагрузить игру?");

    if (confirmRestart) {
        restartGame(); 
    }
});


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








