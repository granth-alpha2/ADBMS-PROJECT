import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    timeout: 15000,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("banksphere-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("banksphere-token");
            localStorage.removeItem("banksphere-user");
            window.dispatchEvent(new Event("banksphere:unauthorized"));
        }
        const message = error.response?.data?.message || error.message || "The request could not be completed.";
        return Promise.reject(Object.assign(new Error(message), { response: error.response }));
    }
);
