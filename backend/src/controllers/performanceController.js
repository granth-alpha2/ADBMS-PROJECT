import { compareIndexPerformance } from "../services/performanceService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function performanceController(request, response) {
    const data = await compareIndexPerformance();
    return sendSuccess(response, {
        message: "Index performance comparison completed.",
        data,
        db: "mongodb",
        executed: "find().explain('executionStats') before and after merchant index"
    });
}
