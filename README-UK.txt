MAXWORLD — Render fix

У ZIP є:
- server.js: HTTP-сервер, прив'язка 0.0.0.0 та process.env.PORT, маршрут / і перевірка /health;
- package.json: команда запуску npm start;
- public/index.html: доступний збережений прототип MAXWORLD.

Render:
Build Command: npm install
Start Command: npm start

Важливо: цей пакет відновлює доступність веб-сторінки, але НЕ є завершеною MMO. У ньому немає багатокористувацької синхронізації та постійної бази даних. Повідомлення memory fallback прямо зазначає це обмеження. Для виправлення саме вже розгорнутого проєкту без втрати його API потрібен актуальний ZIP/репозиторій проєкту.
