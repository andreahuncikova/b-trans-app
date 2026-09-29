# B-Trans App — frontend

React aplikácia pre dopravnú firmu B-Trans (Sverepec, Slovensko).

## Spustenie
```
npm install
npm run dev
```

Predvolene sa pripája na backend na `http://localhost:4000/api`. Pre iné prostredie (napr. produkčný backend) nastav premennú `VITE_API_URL` (napr. v `.env.local`).

## Testy
```
npm test
```
Vitest + Testing Library.

## Tech stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- ExcelJS (generovanie exportu do .xlsx, načítava sa až pri kliknutí na export)

## Stránky
- `/` — verejná úvodná stránka
- `/login` — prihlásenie administrátora
- `/forgot-password` — žiadosť o odkaz na obnovenie hesla
- `/reset-password?token=...` — nastavenie nového hesla
- `/prehlad` — kalendár zastávok, mesačný report a export (domovská stránka admina)
- `/zastavky` — zapísať zastávky
- `/vodici` — vodiči
- `/vozidla` — vozidlá
- `/ziadosti` — žiadosti o prácu (kontakt + životopis) z verejnej stránky

Backend (Node/Express + MongoDB, tiež v TypeScriptu) je v `../backend`.
