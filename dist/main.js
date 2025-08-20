"use strict";
const GOODS = ["Зерно", "Соль", "Шерсть", "Скот", "Бронза", "Древесина"];
const GOODS_IMAGES = ["Grain.png", "Salt.png", "Wool.png", "Cattle.png", "Bronze.png", "Wood.png"];
const CITIES = ["Деревня у моря", "Деревня в лесу", "Деревня в горах", "Деревня в пустыне"];
const LOCATION_IMAGES = ["sea.png", "forest.png", "mountains.png", "desert.png"];
const weights = {
    // A×3, B×2, C×2, D×1
    ALL2: 1, // редко — всё по 2
    ONE_CHEAP: 2, // иногда — один товар = 1
    ONE_EXP: 2, // иногда — один товар = 3
    CHEAP_EXP: 3 // чаще всего — один 1 и один 3
};
// Счетчик дней
let dayCounter = 1;
// Функция для обновления отображения счетчика дней
function updateDayCounter() {
    const dayCounterEl = document.getElementById("dayCounter");
    dayCounterEl.textContent = `(Day ${dayCounter})`;
}
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
    dayCounter++;
    updateDayCounter();
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
                <div class="location-bg" style="background-image: url('assets/locations/${LOCATION_IMAGES[idx]}')"></div>
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
                const cls = isCheap ? "token cheap" : "token exp";
                const t = document.createElement("div");
                t.className = cls;
                // Создаем картинку товара
                const img = document.createElement("img");
                img.src = `assets/goods/${GOODS_IMAGES[i]}`;
                img.alt = g;
                img.className = "good-image";
                t.appendChild(img);
                row.appendChild(t);
                // Добавляем анимацию появления с небольшой задержкой для каждого товара
                setTimeout(() => {
                    t.style.animation = 'fadeInScale 1.2s ease-out forwards';
                }, i * 200); // Увеличенная задержка для каждого товара
            }
        });
    });
}
// Функция для эффекта смены дня и ночи
function playDayNightCycle() {
    const nightOverlay = document.getElementById("nightOverlay");
    const dawnOverlay = document.getElementById("dawnOverlay");
    const roosterSound = document.getElementById("roosterSound");
    // Фаза 1: Наступление ночи (2 секунды - медленное затемнение)
    nightOverlay.classList.add("active");
    setTimeout(() => {
        // Фаза 2: Пауза в темноте (0.5 секунды), затем плавный переход к рассвету
        setTimeout(() => {
            // Плавно переключаемся с ночи на рассвет
            dawnOverlay.classList.add("active");
            // Воспроизводим звук петуха через 1 секунду после начала рассвета
            setTimeout(() => {
                if (roosterSound) {
                    roosterSound.currentTime = 0;
                    roosterSound.play().catch(e => console.log("Не удалось воспроизвести звук петуха:", e));
                }
            }, 1000);
            // Убираем ночь более плавно - через 1 секунду после начала рассвета
            setTimeout(() => {
                nightOverlay.classList.remove("active");
            }, 1000); // Увеличили с 500 до 1000 мс для более плавного перехода
        }, 500); // Пауза в темноте
        // Фаза 3: Держим рассвет на пике (2 секунды), затем плавно убираем
        setTimeout(() => {
            // Начинаем плавно убирать рассвет
            dawnOverlay.classList.remove("active");
        }, 3500); // 500 (пауза) + 3000 (время нарастания рассвета)
    }, 2000); // Время полного затемнения
}
btnUpdate.addEventListener("click", (e) => {
    createParticles(e.target);
    // Запускаем эффект дня и ночи
    playDayNightCycle();
    // Обновляем цены с небольшой задержкой для синхронизации с эффектом
    setTimeout(() => {
        updateTwoCities();
    }, 4000); // Обновляем в момент пика рассвета (2000 + 500 + 1500)
});
btnRaid.addEventListener("click", (e) => {
    createParticles(e.target);
    const hit = Math.random() < 0.33;
    if (hit) {
        // Показываем анимацию засады
        const raidOverlay = document.getElementById("raidOverlay");
        const raidImage = document.getElementById("raidImage");
        const raidersSound = document.getElementById("raidersSound");
        // Перезапускаем анимацию
        raidImage.style.animation = 'none';
        raidOverlay.classList.add("active");
        // Принудительно перезапускаем анимацию
        setTimeout(() => {
            raidImage.style.animation = 'raidPulse 5s ease-in-out';
        }, 10);
        // Воспроизводим звук нападения с fade in
        if (raidersSound) {
            raidersSound.currentTime = 0;
            raidersSound.volume = 0;
            raidersSound.play().then(() => {
                // Fade in за 500ms
                const fadeInDuration = 500;
                const fadeInSteps = 20;
                const volumeStep = 1 / fadeInSteps;
                const stepDuration = fadeInDuration / fadeInSteps;
                let currentStep = 0;
                const fadeInInterval = setInterval(() => {
                    currentStep++;
                    raidersSound.volume = Math.min(currentStep * volumeStep, 1);
                    if (currentStep >= fadeInSteps) {
                        clearInterval(fadeInInterval);
                        // Fade out за 1000ms (1 секунда) перед окончанием анимации
                        setTimeout(() => {
                            const fadeOutDuration = 1000; // Увеличили с 500 до 1000ms
                            const fadeOutSteps = 20;
                            const volumeStepOut = 1 / fadeOutSteps;
                            const stepDurationOut = fadeOutDuration / fadeOutSteps;
                            let currentStepOut = 0;
                            const fadeOutInterval = setInterval(() => {
                                currentStepOut++;
                                raidersSound.volume = Math.max(1 - (currentStepOut * volumeStepOut), 0);
                                if (currentStepOut >= fadeOutSteps) {
                                    clearInterval(fadeOutInterval);
                                    raidersSound.pause();
                                }
                            }, stepDurationOut);
                        }, 3500); // Начинаем fade out за 1.5 секунды до окончания анимации (5000 - 1000 - 500)
                    }
                }, stepDuration);
            }).catch(e => console.log("Не удалось воспроизвести звук нападения:", e));
        }
        // Скрываем через 5 секунд и очищаем результат
        setTimeout(() => {
            raidOverlay.classList.remove("active");
            raidResult.textContent = "";
        }, 5000);
    }
    else {
        // Показываем анимацию безопасного путешествия
        const travelOverlay = document.getElementById("travelOverlay");
        const travelImage = document.getElementById("travelImage");
        const cartSound = document.getElementById("cartSound");
        // Перезапускаем анимацию
        travelImage.style.animation = 'none';
        travelOverlay.classList.add("active");
        // Принудительно перезапускаем анимацию
        setTimeout(() => {
            travelImage.style.animation = 'raidPulse 5s ease-in-out';
        }, 10);
        // Воспроизводим звук безопасного путешествия с fade in
        if (cartSound) {
            cartSound.currentTime = 0;
            cartSound.volume = 0;
            cartSound.play().then(() => {
                // Fade in за 500ms
                const fadeInDuration = 500;
                const fadeInSteps = 20;
                const volumeStep = 1 / fadeInSteps;
                const stepDuration = fadeInDuration / fadeInSteps;
                let currentStep = 0;
                const fadeInInterval = setInterval(() => {
                    currentStep++;
                    cartSound.volume = Math.min(currentStep * volumeStep, 1);
                    if (currentStep >= fadeInSteps) {
                        clearInterval(fadeInInterval);
                        // Fade out за 1000ms (1 секунда) перед окончанием анимации
                        setTimeout(() => {
                            const fadeOutDuration = 1000; // Увеличили с 500 до 1000ms
                            const fadeOutSteps = 20;
                            const volumeStepOut = 1 / fadeOutSteps;
                            const stepDurationOut = fadeOutDuration / fadeOutSteps;
                            let currentStepOut = 0;
                            const fadeOutInterval = setInterval(() => {
                                currentStepOut++;
                                cartSound.volume = Math.max(1 - (currentStepOut * volumeStepOut), 0);
                                if (currentStepOut >= fadeOutSteps) {
                                    clearInterval(fadeOutInterval);
                                    cartSound.pause();
                                }
                            }, stepDurationOut);
                        }, 3500); // Начинаем fade out за 1.5 секунды до окончания анимации (5000 - 1000 - 500)
                    }
                }, stepDuration);
            }).catch(e => console.log("Не удалось воспроизвести звук путешествия:", e));
        }
        // Скрываем через 5 секунд и очищаем результат
        setTimeout(() => {
            travelOverlay.classList.remove("active");
            raidResult.textContent = "";
        }, 5000);
    }
});
// Функция для создания эффекта частиц
function createParticles(button) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Создаем 8-12 частиц
    const particleCount = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        // Случайный размер частицы
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        // Случайное смещение по X
        const xOffset = (Math.random() - 0.5) * 80;
        particle.style.setProperty('--x-offset', `${xOffset}px`);
        // Позиционируем частицу
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        document.body.appendChild(particle);
        // Удаляем частицу после анимации
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}
// начальный рендер
render();
updateDayCounter();
