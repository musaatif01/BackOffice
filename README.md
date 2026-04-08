# BackOffice

Toast-inspired backoffice and admin dashboard for kiosk operations.

## What is included

- Executive dashboard layout with a left command rail and service KPIs
- Kiosk health board with warning and offline visibility
- Menu availability controls and sold-out monitoring
- Promotions spotlight and recent order stream
- Receipt snapshot for the most recent ticket
- Live fetch from `http://localhost:4000/admin/dashboard`
- Automatic fallback to bundled demo data when the backend is unavailable

## Project structure

```text
apps/
  admin/
    index.html
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
```

If that endpoint is unavailable, the UI switches to bundled demo data so the dashboard remains usable.
