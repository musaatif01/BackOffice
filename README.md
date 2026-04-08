# BackOffice

Toast-inspired backoffice and admin dashboard for kiosk operations.

## What is included

- Executive dashboard layout with a left command rail and service KPIs
- Full page set: overview, orders, menu, promotions, kiosks, analytics, and settings
- Kiosk health board with warning and offline visibility
- Menu availability controls and sold-out monitoring
- Promotions spotlight and recent order stream
- Receipt snapshot for the most recent ticket
- Live fetch from `http://localhost:4000/admin/dashboard`, `http://localhost:4000/admin/promotions`, and `http://localhost:4000/admin/locales`
- Truthful live mode: if the backend has no data, the UI stays empty instead of inventing content
- Separate demo mode with intentionally fake sample data

## Project structure

```text
index.html
apps/
  admin/
    src/
      app.js
      styles.css
```

## Run locally

Option 1:
Open `index.html` in a browser.

Option 2:
Run a static server from the repo root:

```powershell
npm start
```

Then open [http://localhost:4173](http://localhost:4173).

## Live data

The dashboard tries to load from:

```text
http://localhost:4000/admin/dashboard
http://localhost:4000/admin/promotions
http://localhost:4000/admin/locales
```

Live mode only shows real backend responses.

If the backend is empty, the pages remain empty.

If the backend is unavailable, the app shows a live-data notice and you can manually switch to demo mode to inspect the populated fake dataset.
