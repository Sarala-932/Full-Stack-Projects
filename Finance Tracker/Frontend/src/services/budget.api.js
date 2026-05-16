import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getCurrentBudget = async (token, accountId) => {
  const res = await api.get(`/${accountId}/budget`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  return res.data;
};

export const updateBudget = async (token, amount) => {
  const res = await api.post(
    "/update",
    {amount},
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
  return res.data;
};
