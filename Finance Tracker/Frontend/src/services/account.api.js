import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const updateDefaultAccount = async (token, accountId) => {
  const res = await api.patch(
    `/account/${accountId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getAccountWithTransactions = async (token, accountId) => {
  const res = await api.get(`/account/${accountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const bulkDeleteTransactions = async (token, accountId, transactionIds) => {
  const res = await api.delete(`/account/${accountId}/bulk-delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {transactionIds},
  });
  return res.data;
};
