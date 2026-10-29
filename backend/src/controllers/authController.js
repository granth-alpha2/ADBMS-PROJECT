import { login } from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function loginController(request, response) {
    const data = await login(request.body);
    return sendSuccess(response, {
        message: "You are signed in.",
        data,
        db: "mongodb",
        executed: "app_users lookup + bcrypt.compare + JWT sign"
    });
}
