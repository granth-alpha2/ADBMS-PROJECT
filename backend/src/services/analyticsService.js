import { runAggregation } from "../repositories/mongoRepository.js";

const depositsVsWithdrawals = [
    { $lookup: {
        from: "transaction_history",
        localField: "linked_accounts",
        foreignField: "account_no",
        as: "transactions"
    } },
    { $unwind: "$transactions" },
    { $match: { "transactions.type": { $in: ["DEPOSIT", "WITHDRAW"] } } },
    { $group: {
        _id: { customer_id: "$_id", name: "$name", type: "$transactions.type" },
        total_amount: { $sum: "$transactions.amount" }
    } },
    { $sort: { "_id.customer_id": 1, "_id.type": 1 } }
];

const monthlyTrend = [
    { $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        transaction_count: { $sum: 1 },
        total_volume: { $sum: "$amount" }
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
];

const topCustomers = [
    { $lookup: {
        from: "customers",
        localField: "account_no",
        foreignField: "linked_accounts",
        as: "customer"
    } },
    { $unwind: "$customer" },
    { $group: {
        _id: "$customer._id",
        name: { $first: "$customer.name" },
        transaction_count: { $sum: 1 },
        total_volume: { $sum: "$amount" }
    } },
    { $sort: { total_volume: -1 } },
    { $limit: 5 }
];

const spendingByCategory = [
    { $match: { type: "WITHDRAW" } },
    { $group: {
        _id: "$category",
        transaction_count: { $sum: 1 },
        total_spend: { $sum: "$amount" }
    } },
    { $sort: { total_spend: -1 } }
];

const customerTransactionJoin = [
    { $lookup: {
        from: "customers",
        localField: "account_no",
        foreignField: "linked_accounts",
        as: "customer"
    } },
    { $unwind: "$customer" },
    { $project: {
        _id: 0,
        customer_id: "$customer._id",
        customer_name: "$customer.name",
        account_no: 1,
        type: 1,
        amount: 1,
        date: 1,
        category: 1
    } },
    { $sort: { date: -1 } },
    { $limit: 20 }
];

const suspiciousActivity = [
    { $match: { amount: { $gte: 10000 } } },
    { $facet: {
        flagged_transactions: [
            { $sort: { amount: -1, date: -1 } },
            { $limit: 20 },
            { $project: { account_no: 1, type: 1, amount: 1, date: 1, merchant: 1 } }
        ],
        summary: [
            { $group: { _id: null, count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }
        ]
    } }
];

export const aggregationCatalog = {
    depositsVsWithdrawals: {
        collection: "customers",
        pipeline: depositsVsWithdrawals,
        executed: "transaction_history $lookup + $unwind + $group/$sum"
    },
    monthlyTrend: {
        collection: "transaction_history",
        pipeline: monthlyTrend,
        executed: "$group by $year/$month + $sort"
    },
    topCustomers: {
        collection: "transaction_history",
        pipeline: topCustomers,
        executed: "$lookup customers + $group/$sum + $sort + $limit 5"
    },
    spendingByCategory: {
        collection: "transaction_history",
        pipeline: spendingByCategory,
        executed: "$match withdrawals + $group/$sum by category"
    },
    customerTransactionJoin: {
        collection: "transaction_history",
        pipeline: customerTransactionJoin,
        executed: "$lookup + $unwind + $project"
    },
    suspiciousActivity: {
        collection: "transaction_history",
        pipeline: suspiciousActivity,
        executed: "$match amount >= threshold + $facet"
    }
};

export async function getAnalyticsReport(reportName) {
    const report = aggregationCatalog[reportName];
    return runAggregation(report.collection, report.pipeline);
}
