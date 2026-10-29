-- Audit every account balance update. The trigger runs in the same transaction
-- as the balance change, so the audit row is committed or rolled back with it.
CREATE OR REPLACE TRIGGER trg_accounts_balance_audit
AFTER UPDATE OF balance ON accounts
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        account_no, action, old_balance, new_balance, changed_at
    ) VALUES (
        :NEW.account_no,
        'BALANCE_UPDATE',
        :OLD.balance,
        :NEW.balance,
        SYSTIMESTAMP
    );
END;
/

-- Reject invalid transaction amounts before they can be stored.
CREATE OR REPLACE TRIGGER trg_transactions_positive_amount
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    IF :NEW.amount IS NULL OR :NEW.amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Transaction amount must be greater than zero.');
    END IF;
END;
/
