import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],

    server: {
        host: "0.0.0.0",

        allowedHosts: [
            ".trycloudflare.com",
            ".qrtable.id.vn",
        ],

        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },

            "/events": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
});