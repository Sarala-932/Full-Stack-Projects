import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

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


