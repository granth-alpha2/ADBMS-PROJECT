# MongoDB design notes

## Embedding and referencing

`customers` embeds `address`, `preferences`, and `kyc` because these values are read and edited with the customer profile. The embedded objects are small, bounded, and naturally owned by one customer.

`linked_accounts` stores account-number references rather than copying balances or account records. Oracle owns account identity and balances, so MongoDB profiles must not become a second source of truth for money.

`transaction_history` is a separate collection. History grows independently from a profile, is searched and paginated by account and date, and is aggregated across customers. It is synchronized only after an Oracle transaction commits. The `account_no` links a history document to the profile's `linked_accounts`.

`activity_logs` is separate because it is an append-oriented operational record with its own retention and time-based queries. Application login users live in `app_users`; this is distinct from MongoDB server users created by `setup_users.js`.

## Indexes

- `customers.email`: unique single-field lookup.
- `transaction_history(account_no, date)`: account history sort and page.
- `transaction_history(type, category, date)`: common analytics and category filters.
- A text index on merchant, category, and tags: full-text exploration.
- `activity_logs.timestamp`: newest-first activity views.
- `app_users.email`: unique application login lookup, created by the API on startup.

The Performance Lab uses a separate named merchant index so it can compare a forced collection scan with an indexed query without dropping application indexes.

## Replica set and transactions

MongoDB transactions require a replica set or sharded cluster. The Compose setup initializes a **single-node** `rs0` for coursework and local demos. It is not highly available. A production deployment should use a multi-node replica set across independent failure domains, authentication, TLS, backups, and monitored recovery procedures.

The transfer sync uses a MongoDB session to insert both account-history documents and one activity-log document atomically. This does not make Oracle and MongoDB a distributed transaction: Oracle commits first, and the API retries the MongoDB sync once. A persistent sync failure is reported in the API response and server logs for reconciliation.

## Server-side demo users

`setup_users.js` creates database users in the `banksphere` database:

- `admin`: `dbOwner` for administration and setup.
- `teller`: `readWrite` for the application API.
- `readOnlyAnalyst`: `read` for reporting.

The application JWT roles (`ADMIN`, `TELLER`, `CUSTOMER`) are separate from MongoDB server roles. Do not use the MongoDB root account as the API's production credential.
