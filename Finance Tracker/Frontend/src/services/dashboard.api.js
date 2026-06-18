import api from "../lib/api.js";

export const createAccount = async (token, data) => {
  const res = await api.post("/create-account", data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getUserAccounts = async (token) => {
  const res = await api.get("/user-accounts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getDashboardData = async (token) => {
  const res = await api.get("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
