import { aggregationCatalog, getAnalyticsReport } from "../services/analyticsService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function analyticsController(request, response) {
    const { report } = request.params;
    const data = await getAnalyticsReport(report);
    return sendSuccess(response, {
        message: "MongoDB analytics report loaded.",
        data,
        db: "mongodb",
        executed: aggregationCatalog[report].executed,
        extraMeta: {
            collection: aggregationCatalog[report].collection,
            pipeline: aggregationCatalog[report].pipeline
        }
    });
}

export function analyticsCatalogController(request, response) {
    const data = Object.entries(aggregationCatalog).map(([id, report]) => ({
        id,
        collection: report.collection,
        pipeline: report.pipeline,
        executed: report.executed
    }));
    return sendSuccess(response, {
        message: "Aggregation pipelines loaded.",
        data,
        db: "mongodb",
        executed: "aggregation pipeline catalog"
    });
}
