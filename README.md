# MAXWORLD — Render Web Service

Browser game with movement, collectible coins, shop, inventory, house building and basic multiplayer presence. Active players see one another in the same world; positions refresh about every 2.5 seconds. PostgreSQL persistence is enabled when `DATABASE_URL` is configured.

## Deploy on Render
1. Upload this project to a new GitHub repository (or push the files from this ZIP to a new repo).
2. In Render choose **New + → Web Service** and connect that repository.
3. Runtime: **Node**. Build command: `npm install`. Start command: `npm start`.
4. For persistent progress, create a PostgreSQL database in Render and add its **Internal Database URL** as environment variable `DATABASE_URL` on the web service. If the database is not configured, the game runs with temporary in-memory storage; player identity is kept in the browser, but game progress resets if the server restarts.
5. Optional: set `ADS_ENABLED=true` and `ADS_PROVIDER` to a label. These settings only show an enabled placeholder; real ad monetization requires a supported ad provider account and its approved ad code.
6. Deploy and open the service URL. Check `/api/health` to verify the service.

## Important notes
- Deploy as a **Web Service**, not a Static Site, because `server.js` provides the API.
- The app uses `process.env.PORT` for Render's port.
- Multiplayer uses polling rather than WebSockets. Players appear online while they keep the game open and are removed after about 45 seconds without updates. Configure PostgreSQL for shared presence and persistent progress. The in-memory fallback is per process and is not shared between multiple server instances.
- Never commit secrets or database credentials to GitHub.
