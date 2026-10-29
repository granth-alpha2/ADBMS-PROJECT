# BankSphere viva guide

## 20 likely questions and short answers

1. **Why does BankSphere use both Oracle and MongoDB?**  
   Oracle protects balances with relational constraints and ACID transactions; MongoDB stores flexible profiles, history, activity, and analytics.

2. **Which database is authoritative for account balances?**  
   Oracle. MongoDB history is a read/analytics copy and never decides whether a withdrawal is allowed.

3. **What does ACID mean?**  
   Atomicity, Consistency, Isolation, and Durability: a money operation either commits fully or rolls back without violating account rules.

4. **How does a withdrawal avoid a negative balance?**  
   The package locks the account, checks available balance, and the accounts table also enforces `CHECK (balance >= 0)`.

5. **What is `banking_pkg`?**  
   An Oracle package that groups deposit, withdraw, transfer, balance, interest, and statement operations behind a documented API.

6. **Why use a package instead of application-side SQL updates?**  
   It centralizes money rules in the database, makes them reusable, and keeps validation and transaction boundaries close to the data.

7. **What does the account audit trigger record?**  
   It inserts the account number, action, old balance, new balance, and change time whenever an account balance is updated.

8. **What does the transaction validation trigger do?**  
   It rejects a transaction row whose amount is null or not greater than zero.

9. **Why does the package use `FOR UPDATE`?**  
   It locks the account row while the operation checks and changes the balance, preventing concurrent operations from spending the same funds.

10. **Why are transaction IDs returned from the package?**  
    The API uses the exact Oracle-created rows for MongoDB synchronization instead of guessing which transaction was inserted most recently.

11. **What is the role of the monthly statement cursor?**  
    It is an explicit parameterized cursor that fetches one account's transactions for a selected month.

12. **When should a MongoDB document embed data?**  
    When the data is bounded, belongs to one parent, and is normally read together; BankSphere embeds address, preferences, and KYC in a customer.

13. **Why are transaction history and activity logs separate collections?**  
    They grow and are queried independently; account history supports account statements and aggregation, while activity logs capture application events.

14. **What is a compound index?**  
    One index over multiple fields; `(account_no, date)` supports filtering by account and sorting that account's history by date.

15. **What do `$group` and `$sum` do?**  
    `$group` collects documents by a key, while `$sum` totals a numeric value or count within each group.

16. **What does `$lookup` provide?**  
    A left-outer join between collections, used here to combine customer profiles with transaction history.

17. **Why does the transfer history sync use a MongoDB session?**  
    It makes both account-history records and the activity record commit or abort together inside MongoDB.

18. **Is the Oracle commit and MongoDB write one distributed transaction?**  
    No. Oracle commits first; the API retries the MongoDB write once and exposes a reconciliation warning if it still fails.

19. **What does `explain("executionStats")` show?**  
    It reports execution details such as documents examined, index keys examined, and elapsed execution time for a query plan.

20. **Why does MongoDB need a replica set for this project?**  
    The MongoDB session transaction API requires a replica set or sharded deployment; the local Compose setup uses one node to demonstrate it.

## Five-minute demo script

### 0:00–0:40 — Explain the architecture

- Open **How it works**.
- Click User → API → Oracle → Trigger → MongoDB → Analytics.
- Point out that Oracle is authoritative for money and MongoDB holds flexible context.
- Identify the three syllabus units on the unit map.

### 0:40–1:50 — Unit 1: PL/SQL

- Sign in as the teller demo account.
- Open **Move money** and show the deposit, withdrawal, and transfer forms.
- Enter a transfer and review the confirmation modal before submitting.
- Show the Oracle explanation badge and describe the package's row locks, commit, and audit trigger.
- If the local Oracle seed is installed, attempt an amount larger than the source balance to show the PL/SQL insufficient-funds message and rollback.

### 1:50–3:00 — Unit 2: MongoDB Fundamentals

- Open **Customer profile** and edit a nested address or preference field.
- Add and remove a linked account to demonstrate array updates.
- Open **Transaction history**, filter by type, search, paginate, and export the visible page as CSV.
- Explain the embedded profile objects versus account references.

### 3:00–4:20 — Unit 3: Advanced MongoDB

- Open **Analytics studio** and show the customer totals, monthly trend, top-five list, category chart, join, and suspicious-activity view.
- Open one **Show pipeline** drawer and explain `$match`, `$group`, `$sum`, `$lookup`, or `$facet`.
- Open **Performance lab**, run the comparison, and compare documents/keys examined before and after the merchant index.

### 4:20–5:00 — Administration and recap

- Open **Administration** to compare the Oracle audit log with MongoDB activity logs.
- Toggle Explain mode and dark mode.
- Close by summarizing: Oracle commits balances, the trigger audits them, MongoDB stores flexible history, and aggregation answers analytics questions.
