# B-Trans App — frontend

React aplikácia pre dopravnú firmu B-Trans (Sverepec, Slovensko).

## Spustenie
```
npm install
npm run dev
```

## Tech stack
- React + Vite
- Tailwind CSS v4
- React Router

## Stránky
- `/` — verejná úvodná stránka
- `/prehlad` — kalendár zastávok (domovská stránka admina)
- `/zastavky` — zapísať zastávky
- `/report` — mesačný report
- `/vodici` — vodiči
- `/vozidla` — vozidlá

Backend (Node/Express + MongoDB) je v `../backend` — zatiaľ s ním frontend nie je prepojený, beží na mock dátach priamo v komponentoch.
