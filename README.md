# Караваны — рынок

Игра-симулятор торговли караванами с динамическими ценами в городах.

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Сборка TypeScript
npm run build

# Запуск локального сервера
npm run serve
```

## Развертывание на GitHub Pages

1. Убедитесь, что все файлы закоммичены в репозиторий
2. В настройках репозитория (Settings → Pages):
   - Source: Deploy from a branch
   - Branch: main (или master)
   - Folder: / (root)
3. Нажмите Save

### Важные файлы для GitHub Pages:

- `index.html` - главная страница
- `styles.css` - стили
- `dist/main.js` - скомпилированный JavaScript
- `.nojekyll` - отключает Jekyll обработку

### Устранение проблем:

- **404 ошибка favicon.ico**: Добавлен встроенный SVG favicon в HTML
- **Пустые файлы**: Убедитесь, что выполнен `npm run build`
- **Неправильные пути**: Все пути относительные, должны работать на GitHub Pages

## Структура проекта

```
├── index.html          # Главная страница
├── styles.css          # Стили
├── src/main.ts         # TypeScript исходник
├── dist/main.js        # Скомпилированный JavaScript
├── package.json        # Зависимости и скрипты
├── tsconfig.json       # Конфигурация TypeScript
└── .nojekyll          # Отключение Jekyll для GitHub Pages
```
