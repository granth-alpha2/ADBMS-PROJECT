# BankSphere: Banking Transaction and Analytics System

BankSphere is a full-stack academic project that demonstrates the difference between Oracle PL/SQL and MongoDB in a real banking workflow.

- Oracle PL/SQL handles money-critical actions such as deposit, withdraw, transfer, balance checks, and audit logging with transaction safety.
- MongoDB stores flexible customer profiles, transaction history, and analytics-ready logs.
- The frontend shows a small "Behind the scenes" badge for every action so the user can immediately see which database and procedure/query handled the request.

## Project idea

This project is designed for a B.Tech CSE course covering:

- Unit 1: PL/SQL and Oracle database logic
- Unit 2: MongoDB fundamentals and CRUD/query operations
- Unit 3: Advanced MongoDB aggregation, performance tuning, and transactions

The app includes a React + Vite frontend, an Express API, Oracle XE integration, and MongoDB analytics.

## Folder tree

```text
BankSphere/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── openapi.js
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── node_modules/
├── database/
│   ├── mongo/
│   │   ├── aggregations.js
│   │   ├── backup.ps1
│   │   ├── collections.js
│   │   ├── crud_examples.js
│   │   ├── indexes.js
│   │   ├── init-replica.js
│   │   ├── performance_explain.js
│   │   ├── restore.ps1
│   │   ├── seed.js
│   │   ├── setup_users.js
│   │   └── transfer_transaction_demo.js
│   └── oracle/
│       ├── banking_pkg.sql
│       ├── schema.sql
│       ├── seed.sql
│       └── triggers.sql
├── docs/
│   ├── BankSphere.http
│   ├── MONGODB_DESIGN.md
│   └── VIVA_GUIDE.md
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── index.css
    │   ├── main.jsx
    │   └── pages/
    └── dist/
```

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Axios, lucide-react
- Backend: Node.js + Express, JWT auth, bcrypt, oracledb, mongodb, Helmet, CORS, rate limiter, Swagger
- Oracle: Oracle XE 21c and PL/SQL procedures, triggers, functions, and packages
- MongoDB: MongoDB 7 with aggregation pipelines, indexing, replica set, and session transactions

## High-level architecture

```mermaid
flowchart LR
    U[User] --> F[React Frontend]
    F --> B[Express API]
    B --> O[Oracle Database]
    B --> M[MongoDB]
    O --> T[PL/SQL Triggers]
    O --> A[Audit Logs]
    M --> P[Analytics Reports]
    P --> UI[Charts and Insights]
```

## ER / data model

```mermaid
erDiagram
    CUSTOMER ||--o{ ACCOUNT : owns
    ACCOUNT ||--o{ TRANSACTION : records
    ACCOUNT ||--o{ AUDIT_LOG : changes
    CUSTOMER ||--o{ MONGO_PROFILE : profile
    CUSTOMER ||--o{ MONGO_HISTORY : activity
```

## Core features

- Oracle money-critical operations with transaction control and rollback safety
- MongoDB customer profile and transaction history storage
- Aggregation analytics for deposits, spending, trends, and suspicious activity
- Admin audit log viewer
- Explain-mode UI showing behind-the-scenes database execution details
- Role-based access: ADMIN, TELLER, CUSTOMER
- CSV export, filters, charts, and responsive dashboard views

## Quick start

### 1) Configure environment variables

Copy the root example file and edit the values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Example root values:

```env
ORACLE_SYSTEM_PASSWORD=ChangeMeOracleSystem!123
ORACLE_USER=banksphere_app
ORACLE_PASSWORD=ChangeMeOracleApp!123
MONGO_ROOT_USERNAME=banksphereRoot
MONGO_ROOT_PASSWORD=ChangeMeMongoRoot!123
```

### 2) Start the databases with Docker

```bash
docker compose up -d
```

This starts:

- Oracle XE at localhost:1521
- MongoDB at localhost:27017 with a replica set

### 3) Run Oracle schema and seed scripts

If Oracle tooling is available locally, run the scripts in order:

```bash
sqlplus system/"YourPassword"@localhost:1521/XEPDB1 @database/oracle/schema.sql
sqlplus system/"YourPassword"@localhost:1521/XEPDB1 @database/oracle/triggers.sql
sqlplus system/"YourPassword"@localhost:1521/XEPDB1 @database/oracle/seed.sql
```

You can also load the package body directly:

```bash
sqlplus system/"YourPassword"@localhost:1521/XEPDB1 @database/oracle/banking_pkg.sql
```

### 4) Run MongoDB seed and setup scripts

```bash
mongosh "mongodb://banksphereRoot:ChangeMeMongoRoot!123@localhost:27017/admin?replicaSet=rs0" ./database/mongo/collections.js
mongosh "mongodb://banksphereRoot:ChangeMeMongoRoot!123@localhost:27017/admin?replicaSet=rs0" ./database/mongo/seed.js
mongosh "mongodb://banksphereRoot:ChangeMeMongoRoot!123@localhost:27017/admin?replicaSet=rs0" ./database/mongo/setup_users.js
mongosh "mongodb://banksphereRoot:ChangeMeMongoRoot!123@localhost:27017/admin?replicaSet=rs0" ./database/mongo/indexes.js
```

### 5) Install backend packages

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

### 6) Install frontend packages

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo credentials

The app is built with quick-fill demo users for course demonstration:

- Admin: `admin@banksphere.local` / password from `.env`
- Teller: `teller@banksphere.local` / password from `.env`
- Customer: `customer@banksphere.local` / password from `.env`

The values are defined in `backend/.env.example` and can be changed for local testing.

## API docs and endpoint tests

- Swagger UI: `http://localhost:4000/api/docs`
- REST examples: `docs/BankSphere.http`

## Screenshots placeholder

- Login screen: add screenshot here
- Dashboard: add screenshot here
- Banking action form: add screenshot here
- Analytics dashboard: add screenshot here
- Admin view: add screenshot here

## Validation notes

The frontend production build and backend syntax validation were checked successfully in this environment.

Oracle and MongoDB runtime validation should be performed in a local Docker-based or installed database environment before final viva/demo use.

## Documentation

- MongoDB design notes: `docs/MONGODB_DESIGN.md`
- Viva guide: `docs/VIVA_GUIDE.md`

## License

This project was prepared as an academic course deliverable and is intended for educational use.
