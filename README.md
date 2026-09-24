# B-Trans App

Aplikácia pre dopravnú firmu B-Trans (Sverepec, Slovensko). Monorepo s dvomi nezávislými časťami:

- [`frontend/`](frontend/) — React + Vite + Tailwind
- [`backend/`](backend/) — Node.js + Express + MongoDB API s JWT prihlasovaním

Každá časť má vlastný `package.json` a spúšťa sa samostatne — pozri README v danom priečinku. Pri hostingu nastav pre každú službu (napr. Vercel/Netlify pre frontend, Render/Railway pre backend) príslušný root directory (`frontend` / `backend`).
