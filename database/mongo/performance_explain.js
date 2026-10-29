// Compare executionStats before and after indexing a frequently filtered field.
// This demo manages only its named index and prints comparable explain metrics.
const history = db.getSiblingDB("banksphere").transaction_history;
const query = { merchant: "Northstar Market" };
const indexName = "ix_history_merchant_performance_demo";

if (history.getIndexes().some((index) => index.name === indexName)) {
    history.dropIndex(indexName);
}
const before = history.find(query).explain("executionStats").executionStats;
history.createIndex({ merchant: 1 }, { name: indexName });
const after = history.find(query).explain("executionStats").executionStats;

printjson({
    query,
    before_index: {
        documents_examined: before.totalDocsExamined,
        keys_examined: before.totalKeysExamined,
        execution_time_ms: before.executionTimeMillis
    },
    after_index: {
        documents_examined: after.totalDocsExamined,
        keys_examined: after.totalKeysExamined,
        execution_time_ms: after.executionTimeMillis
    }
});
