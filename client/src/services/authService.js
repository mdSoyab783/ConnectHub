import api from "./api";

export const loginUser = async (identifier, password) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};