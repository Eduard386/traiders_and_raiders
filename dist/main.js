"use strict";
const GOODS = ["Зерно", "Соль", "Шерсть", "Скот", "Бронза", "Древесина"];
const GOODS_IMAGES = ["Grain.png", "Salt.png", "Wool.png", "Cattle.png", "Bronze.png", "Wood.png"];
const CITIES = ["Портовый", "Горная крепость", "Лесная деревня", "Оазис"];
const weights = {
    // A×3, B×2, C×2, D×1
    ALL2: 3, // чаще всего — всё по 2
    ONE_CHEAP: 2, // иногда — один товар = 1
    ONE_EXP: 2, // иногда — один товар = 3
    CHEAP_EXP: 1 // редко — один 1 и один 3
};
const boardEl = document.getElementById("board");
const btnUpdate = document.getElementById("btnUpdate");
const btnRaid = document.getElementById("btnRaid");
const raidResult = document.getElementById("raidResult");
const cityStates = CITIES.map(() => ({ mode: "ALL2" }));
function randInt(max) { return Math.floor(Math.random() * max); }
function sampleDistinct(n, k) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, k);
}
function weightedPick(map) {
    const entries = Object.entries(map);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) {
        if ((r -= w) <= 0)
            return k;
    }
    return entries[entries.length - 1][0];
}
function newState(mode) {
    if (mode === "ALL2")
        return { mode };
    if (mode === "ONE_CHEAP") {
        return { mode, cheap: [randInt(GOODS.length)] };
    }
    if (mode === "ONE_EXP") {
        return { mode, exp: [randInt(GOODS.length)] };
    }
    // CHEAP_EXP
    const [i, j] = sampleDistinct(GOODS.length, 2);
    return { mode, cheap: [i], exp: [j] };
}
function updateTwoCities() {
    const toUpdate = sampleDistinct(CITIES.length, 2);
    for (const idx of toUpdate) {
        const mode = weightedPick(weights);
        cityStates[idx] = newState(mode);
    }
    render();
}
function render() {
    // первичный рендер карточек городов
    if (!boardEl.childElementCount) {
        CITIES.forEach((name, idx) => {
            const el = document.createElement("section");
            el.className = "city";
            el.id = `city-${idx}`;
            el.innerHTML = `
        <h2>${name}</h2>
        <div class="row" id="row-${idx}"></div>
      `;
            boardEl.appendChild(el);
        });
    }
    // обновляем содержимое
    cityStates.forEach((st, idx) => {
        const row = document.getElementById(`row-${idx}`);
        row.innerHTML = "";
        const cheapSet = new Set(st.cheap ?? []);
        const expSet = new Set(st.exp ?? []);
        // Показываем только товары с ценами 1 или 3
        GOODS.forEach((g, i) => {
            const isCheap = cheapSet.has(i);
            const isExp = expSet.has(i);
            // Показываем только если цена не 2
            if (isCheap || isExp) {
                const val = isCheap ? "1" : "3";
                const cls = isCheap ? "token cheap" : "token exp";
                const t = document.createElement("div");
                t.className = cls;
                // Создаем картинку товара
                const img = document.createElement("img");
                img.src = `assets/goods/${GOODS_IMAGES[i]}`;
                img.alt = g;
                img.className = "good-image";
                // Создаем контейнер для цены и стрелки
                const priceContainer = document.createElement("div");
                priceContainer.className = "price-container";
                const priceSpan = document.createElement("span");
                priceSpan.className = "val";
                priceSpan.textContent = val;
                // Добавляем стрелку
                const arrow = document.createElement("span");
                arrow.className = `arrow ${isCheap ? 'down' : 'up'}`;
                arrow.textContent = isCheap ? '↓' : '↑';
                priceContainer.appendChild(priceSpan);
                priceContainer.appendChild(arrow);
                t.appendChild(img);
                t.appendChild(priceContainer);
                row.appendChild(t);
            }
        });
    });
}
btnUpdate.addEventListener("click", updateTwoCities);
btnRaid.addEventListener("click", () => {
    const hit = Math.random() < 0.5;
    if (hit) {
        raidResult.textContent = "Засада! Без охраны: потеряешь 2/3 стоимости груза. С охраной: заплати 1/3 и едешь безопасно.";
        raidResult.style.color = "#d7263d";
    }
    else {
        raidResult.textContent = "Чисто — проезжай.";
        raidResult.style.color = "green";
    }
});
// начальный рендер
render();
