const character = {
    name: "Арнольд",   // Имя персонажа, отображаемое на экране
    health: 50,        // Текущее здоровье персонажа
    maxHealth: 100,    // Максимальное здоровье, которое может быть у персонажа
    strength: 10,      // Сила, которая будет использоваться для атаки
    defense: 5,        // Защита, которая уменьшает урон от врагов
    level: 1,          // Текущий уровень персонажа, начинаем с 1
    experience: 20,    // Начальный опыт персонажа, который он будет зарабатывать в бою
    inventory: []      // Пустой инвентарь, в который мы будем добавлять предметы
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
});









// Враги
const enemies = {
    dragon: {
        name: "dragon",
        health: 60,
        strength: 40,
        defense: 20,
        experience: 20 // Опыт за убийство
    },
    chimera: {
        name: "chimera",
        health: 80,
        strength: 45,
        defense: 30,
        experience: 30,
    },
    ouroboros: {
        name: "ouroboros",
        health: 100,
        strength: 55,
        defense: 40,
        experience: 50,
    },
}
