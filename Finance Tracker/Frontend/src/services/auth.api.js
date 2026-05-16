import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

export const syncUserWithBackend = async (userData, token) => {
    try {
        const response = await api.post("/api/register", userData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export default {syncUserWithBackend};
