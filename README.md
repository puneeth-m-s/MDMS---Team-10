# MDMS · Phase 1

React, TypeScript, Vite and JSON Server foundation for the Meter Data Management System.

## Start the project

```bash
npm install
npm run generate:data
```

Open two terminals in the project folder:

```bash
npm run server
```

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173`. JSON Server serves the read-only demo data at `http://localhost:3000`.

Open `/login` and choose one of the temporary End-user, Zone admin or Enterprise links to enter that workspace. The login, reset, management and settings forms validate their inputs, but Phase 1 does not save changes or perform real authentication, payments or email delivery.

## Regenerate demo data

`npm run generate:data` runs `scripts/generateData.mjs` to write the sample zones, users, meters, bills, readings, chart series, alerts, notifications, audit logs and settings to `db.json`.

All app data requests use GET through the shared Axios instance in `src/services/http.ts`. Filtering, sorting and pagination for tables are sent to JSON Server.

## Team workflow

Use one shared repository. Work on a task branch, open a pull request for review, and merge after a teammate reviews it. Keep commits small and clear so each team member's work is visible.
