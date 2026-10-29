-- BankSphere banking package specification: public money and reporting API.
CREATE OR REPLACE PACKAGE banking_pkg AS
    PROCEDURE deposit(
        p_account_no IN accounts.account_no%TYPE,
        p_amount     IN transactions.amount%TYPE,
        p_txn_id     OUT transactions.txn_id%TYPE
    );

    PROCEDURE withdraw(
        p_account_no IN accounts.account_no%TYPE,
        p_amount     IN transactions.amount%TYPE,
        p_txn_id     OUT transactions.txn_id%TYPE
    );

    PROCEDURE transfer(
        p_from_account IN accounts.account_no%TYPE,
        p_to_account   IN accounts.account_no%TYPE,
        p_amount       IN transactions.amount%TYPE,
        p_from_txn_id  OUT transactions.txn_id%TYPE,
        p_to_txn_id    OUT transactions.txn_id%TYPE
    );

    FUNCTION get_balance(
        p_account_no IN accounts.account_no%TYPE
    ) RETURN accounts.balance%TYPE;

    FUNCTION calculate_interest(
        p_account_no IN accounts.account_no%TYPE,
        p_annual_rate IN NUMBER
    ) RETURN NUMBER;

    PROCEDURE monthly_statement(
        p_account_no IN accounts.account_no%TYPE,
        p_year       IN NUMBER,
        p_month      IN NUMBER
    );

    PROCEDURE list_low_balance_accounts(
        p_threshold IN accounts.balance%TYPE
    );
END banking_pkg;
/

-- BankSphere package body: validate accounts, update balances, and record
-- matching transaction rows within the same Oracle transaction.
CREATE OR REPLACE PACKAGE BODY banking_pkg AS
    e_insufficient_funds EXCEPTION;
    e_account_frozen EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_insufficient_funds, -20001);
    PRAGMA EXCEPTION_INIT(e_account_frozen, -20002);

    PROCEDURE require_active_account(
        p_account_no IN accounts.account_no%TYPE,
        p_balance OUT accounts.balance%TYPE
    ) IS
        v_status accounts.status%TYPE;
    BEGIN
        SELECT balance, status
          INTO p_balance, v_status
          FROM accounts
         WHERE account_no = p_account_no
           FOR UPDATE;

        IF v_status <> 'ACTIVE' THEN
            RAISE e_account_frozen;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' was not found.');
    END require_active_account;

    PROCEDURE deposit(
        p_account_no IN accounts.account_no%TYPE,
        p_amount     IN transactions.amount%TYPE,
        p_txn_id     OUT transactions.txn_id%TYPE
    ) IS
        v_balance accounts.balance%TYPE;
        v_new_balance accounts.balance%TYPE;
    BEGIN
        SAVEPOINT deposit_start;
        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Deposit amount must be greater than zero.');
        END IF;

        require_active_account(p_account_no, v_balance);
        v_new_balance := v_balance + p_amount;

        UPDATE accounts SET balance = v_new_balance WHERE account_no = p_account_no;
        INSERT INTO transactions (account_no, txn_type, amount, balance_after)
        VALUES (p_account_no, 'DEPOSIT', p_amount, v_new_balance)
        RETURNING txn_id INTO p_txn_id;
        COMMIT;
    EXCEPTION
        WHEN e_account_frozen THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Account ' || p_account_no || ' is frozen or closed.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END deposit;

    PROCEDURE withdraw(
        p_account_no IN accounts.account_no%TYPE,
        p_amount     IN transactions.amount%TYPE,
        p_txn_id     OUT transactions.txn_id%TYPE
    ) IS
        v_balance accounts.balance%TYPE;
        v_new_balance accounts.balance%TYPE;
    BEGIN
        SAVEPOINT withdraw_start;
        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Withdrawal amount must be greater than zero.');
        END IF;

        require_active_account(p_account_no, v_balance);
        IF v_balance < p_amount THEN
            RAISE e_insufficient_funds;
        END IF;
        v_new_balance := v_balance - p_amount;

        UPDATE accounts SET balance = v_new_balance WHERE account_no = p_account_no;
        INSERT INTO transactions (account_no, txn_type, amount, balance_after)
        VALUES (p_account_no, 'WITHDRAW', p_amount, v_new_balance)
        RETURNING txn_id INTO p_txn_id;
        COMMIT;
    EXCEPTION
        WHEN e_insufficient_funds THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds in account ' || p_account_no || '.');
        WHEN e_account_frozen THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'Account ' || p_account_no || ' is frozen or closed.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END withdraw;

    PROCEDURE transfer(
        p_from_account IN accounts.account_no%TYPE,
        p_to_account   IN accounts.account_no%TYPE,
        p_amount       IN transactions.amount%TYPE,
        p_from_txn_id  OUT transactions.txn_id%TYPE,
        p_to_txn_id    OUT transactions.txn_id%TYPE
    ) IS
        v_from_balance accounts.balance%TYPE;
        v_to_balance accounts.balance%TYPE;
        v_from_after accounts.balance%TYPE;
        v_to_after accounts.balance%TYPE;
    BEGIN
        SAVEPOINT transfer_start;
        IF p_from_account = p_to_account THEN
            RAISE_APPLICATION_ERROR(-20005, 'Source and destination accounts must be different.');
        END IF;
        IF p_amount IS NULL OR p_amount <= 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Transfer amount must be greater than zero.');
        END IF;

        -- Lock in a stable order so concurrent transfers avoid lock-order deadlocks.
        IF p_from_account < p_to_account THEN
            require_active_account(p_from_account, v_from_balance);
            require_active_account(p_to_account, v_to_balance);
        ELSE
            require_active_account(p_to_account, v_to_balance);
            require_active_account(p_from_account, v_from_balance);
        END IF;

        IF v_from_balance < p_amount THEN
            RAISE e_insufficient_funds;
        END IF;
        v_from_after := v_from_balance - p_amount;
        v_to_after := v_to_balance + p_amount;

        UPDATE accounts SET balance = v_from_after WHERE account_no = p_from_account;
        UPDATE accounts SET balance = v_to_after WHERE account_no = p_to_account;
        INSERT INTO transactions (
            account_no, txn_type, amount, balance_after, related_account
        ) VALUES (
            p_from_account, 'TRANSFER', p_amount, v_from_after, p_to_account
        ) RETURNING txn_id INTO p_from_txn_id;
        INSERT INTO transactions (
            account_no, txn_type, amount, balance_after, related_account
        ) VALUES (
            p_to_account, 'TRANSFER', p_amount, v_to_after, p_from_account
        ) RETURNING txn_id INTO p_to_txn_id;
        COMMIT;
    EXCEPTION
        WHEN e_insufficient_funds THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds in account ' || p_from_account || '.');
        WHEN e_account_frozen THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20002, 'A transfer account is frozen or closed.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END transfer;

    FUNCTION get_balance(
        p_account_no IN accounts.account_no%TYPE
    ) RETURN accounts.balance%TYPE IS
        v_balance accounts.balance%TYPE;
    BEGIN
        SELECT balance INTO v_balance FROM accounts WHERE account_no = p_account_no;
        RETURN v_balance;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'Account ' || p_account_no || ' was not found.');
    END get_balance;

    FUNCTION calculate_interest(
        p_account_no IN accounts.account_no%TYPE,
        p_annual_rate IN NUMBER
    ) RETURN NUMBER IS
    BEGIN
        IF p_annual_rate < 0 THEN
            RAISE_APPLICATION_ERROR(-20006, 'Annual interest rate cannot be negative.');
        END IF;
        RETURN ROUND(get_balance(p_account_no) * p_annual_rate / 100, 2);
    END calculate_interest;

    PROCEDURE monthly_statement(
        p_account_no IN accounts.account_no%TYPE,
        p_year       IN NUMBER,
        p_month      IN NUMBER
    ) IS
        -- A parameterized explicit cursor selects one account's requested month.
        CURSOR c_statement(
            cp_account_no accounts.account_no%TYPE,
            cp_start_date DATE,
            cp_end_date DATE
        ) IS
            SELECT *
              FROM transactions
             WHERE account_no = cp_account_no
               AND txn_date >= cp_start_date
               AND txn_date < cp_end_date
             ORDER BY txn_date, txn_id;
        v_transaction transactions%ROWTYPE;
        v_start_date DATE;
        v_end_date DATE;
    BEGIN
        IF p_month < 1 OR p_month > 12 THEN
            RAISE_APPLICATION_ERROR(-20007, 'Month must be between 1 and 12.');
        END IF;
        v_start_date := TO_DATE(p_year || LPAD(p_month, 2, '0') || '01', 'YYYYMMDD');
        v_end_date := ADD_MONTHS(v_start_date, 1);
        DBMS_OUTPUT.PUT_LINE('Statement for ' || p_account_no || ' from ' || v_start_date);

        OPEN c_statement(p_account_no, v_start_date, v_end_date);
        LOOP
            FETCH c_statement INTO v_transaction;
            EXIT WHEN c_statement%NOTFOUND;
            DBMS_OUTPUT.PUT_LINE(
                v_transaction.txn_date || ' | ' || v_transaction.txn_type || ' | ' ||
                v_transaction.amount || ' | balance ' || v_transaction.balance_after
            );
        END LOOP;
        CLOSE c_statement;
    EXCEPTION
        WHEN OTHERS THEN
            IF c_statement%ISOPEN THEN
                CLOSE c_statement;
            END IF;
            RAISE;
    END monthly_statement;

    PROCEDURE list_low_balance_accounts(
        p_threshold IN accounts.balance%TYPE
    ) IS
        -- The cursor FOR loop opens, fetches, and closes this cursor automatically.
        CURSOR c_low_balance IS
            SELECT * FROM accounts WHERE balance < p_threshold ORDER BY balance;
    BEGIN
        FOR account_row IN c_low_balance LOOP
            DBMS_OUTPUT.PUT_LINE(
                account_row.account_no || ' | customer ' || account_row.customer_id ||
                ' | balance ' || account_row.balance
            );
        END LOOP;
    END list_low_balance_accounts;
END banking_pkg;
/
