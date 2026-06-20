import api from "../lib/api.js";

export const addInvestment = async (token, data) => {
    const res = await api.post("/investments", data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const getInvestments = async (token) => {
    const res = await api.get("/investments", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const updateInvestment = async (token, id, data) => {
    const res = await api.put(`/investments/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const deleteInvestment = async (token, id) => {
    const res = await api.delete(`/investments/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const syncLivePrices = async (token) => {
    const res = await api.post("/investments/sync", {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const searchSymbols = async (token, query, type) => {
    let url = `/investments/search?q=${encodeURIComponent(query)}`;
    if (type) {
        url += `&type=${encodeURIComponent(type)}`;
    }
    const res = await api.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const fetchCurrentPrice = async (token, symbol, type) => {
    const res = await api.get(`/investments/price?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
