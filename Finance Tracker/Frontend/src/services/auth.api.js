import api from "../lib/api.js";

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
