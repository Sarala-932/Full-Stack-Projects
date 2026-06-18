import api from "../lib/api.js";

export const getCurrentBudget = async (token, accountId) => {
  const res = await api.get(`/${accountId}/budget`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  return res.data;
};

export const updateBudget = async (token, { amount, accountId, categoryLimits }) => {
  const res = await api.post(
    "/update",
    { amount, accountId, categoryLimits },
    {
      headers: {Authorization: `Bearer ${token}`},
    },
  );
  return res.data;
};
