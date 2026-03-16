import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
});

export const authHeaders = (jwtToken: string | null) => {
    if (!jwtToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${jwtToken}`,
    };
};
