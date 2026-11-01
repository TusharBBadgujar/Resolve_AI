# ResolvAI

ResolvAI is an e-commerce support-agent demo that walks through a ReAct workflow: understand a customer request, plan an action, check safety rules, perform the action, and explain the result. Sample orders and audit entries persist in MongoDB. Refund processing and courier tracking are simulated; no real payment gateway or courier is connected.

## Hackathon team

Team size: 4 members.

## Requirements

- Node.js
- MongoDB Community Server running locally, or a MongoDB connection URI
- MongoDB Compass (optional, to browse the database)

## Run with MongoDB

1. Make sure the MongoDB service is running. The default connection is `mongodb://127.0.0.1:27017`.
2. From this folder, install dependencies and start the app:

   ```powershell
   npm install
   npm start
   ```

3. Open `http://localhost:3000`.

The app connects to the `Resolve_AI` database and creates it, along with the `orders` and `audit_ledger` collections, when it first writes the sample data. Orders, address changes, refunds, escalations, and audit entries are stored in MongoDB. Reset Data restores the sample records.

## MongoDB Compass

In Compass, connect with:

```text
mongodb://127.0.0.1:27017
```

Refresh the databases list and open `Resolve_AI`. The database appears after the app starts and seeds its sample records. Compass is the database viewer; the app connects to the MongoDB server, not to the Compass application.

For a different MongoDB server, create a local `.env` file based on `.env.example` and set `MONGODB_URI` to that server's connection URI. The app still uses the database name `Resolve_AI`.

## Demo

Refunds, escalation cases, address changes, and sample order lookups can be exercised with the preset scenarios in the app. Add the short demo-video link to the Homingo Hack Days dashboard as required by the event.
