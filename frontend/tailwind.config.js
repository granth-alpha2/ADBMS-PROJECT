/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    500: "#3978e8",
                    600: "#2863d4",
                    700: "#214fad",
                    800: "#1d438f",
                    900: "#1b3978",
                    950: "#142b5c"
                }
            },
            boxShadow: {
                card: "0 12px 34px rgba(20, 43, 82, 0.06)"
            }
        }
    },
    plugins: []
};
