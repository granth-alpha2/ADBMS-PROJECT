export const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "BankSphere API",
        version: "1.0.0",
        description: "Oracle PL/SQL handles money-critical operations; MongoDB stores flexible profiles, history, and analytics."
    },
    servers: [{ url: "http://localhost:4000/api" }],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        },
        schemas: {
            ApiResponse: {
                type: "object",
                required: ["success", "message", "data", "meta"],
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {},
                    meta: {
                        type: "object",
                        properties: {
                            db: { type: "string", enum: ["oracle", "mongodb", "none"] },
                            executed: { type: "string" }
                        }
                    }
                }
            }
        }
    },
    paths: {
        "/auth/login": {
            post: {
                summary: "Sign in and receive a JWT",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", required: ["email", "password"] } } }
                },
                responses: { 200: { description: "Authenticated" }, 401: { description: "Invalid credentials" } }
            }
        },
        "/transactions/deposit": {
            post: {
                summary: "Deposit through banking_pkg.deposit",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Oracle deposit and MongoDB sync result" } }
            }
        },
        "/transactions/withdraw": {
            post: {
                summary: "Withdraw through banking_pkg.withdraw",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Oracle withdrawal and MongoDB sync result" } }
            }
        },
        "/transactions/transfer": {
            post: {
                summary: "Transfer through banking_pkg.transfer",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Oracle transfer and MongoDB session sync result" } }
            }
        },
        "/transactions": {
            get: {
                summary: "Search and paginate transaction history",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "MongoDB transaction history" } }
            }
        },
        "/analytics/{report}": {
            get: {
                summary: "Run a documented MongoDB aggregation report",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "report", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Aggregation results and pipeline metadata" } }
            }
        },
        "/accounts/{accountNo}/balance": {
            get: {
                summary: "Read a balance through banking_pkg.get_balance",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "accountNo", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Oracle account balance" } }
            }
        },
        "/dashboard/{accountNo}": {
            get: {
                summary: "Load Oracle balance and MongoDB recent activity",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "accountNo", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Dashboard account data" } }
            }
        },
        "/profiles/{customerId}": {
            get: {
                summary: "Read a MongoDB customer profile",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "customerId", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "MongoDB customer profile" } }
            },
            patch: {
                summary: "Update embedded address or preferences",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Updated MongoDB customer profile" } }
            }
        },
        "/admin/audit-logs": {
            get: {
                summary: "View balance changes written by the Oracle trigger",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Oracle audit log page" } }
            }
        },
        "/admin/activity-logs": {
            get: {
                summary: "View MongoDB application activity",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "MongoDB activity log page" } }
            }
        },
        "/admin/users": {
            get: {
                summary: "List application users and roles",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Users without password hashes" } }
            }
        },
        "/performance": {
            get: {
                summary: "Compare MongoDB executionStats before and after a merchant index",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Documents and keys examined before and after indexing" } }
            }
        }
    }
};
