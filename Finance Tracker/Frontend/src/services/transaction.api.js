import api from "../lib/api.js";

export const createTransaction = async (token, data) => {
    const res = await api.post("/create", data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
export const bulkCreateTransactions = async (token, data) => {
    const res = await api.post("/bulk-create", data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const scanReceipt = async (token, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/scan", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};

export const getTransaction = async (token, id) => {
    const res = await api.get(`/transaction/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const updateTransaction = async (token, id, data) => {
    const res = await api.put(`/transaction/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
