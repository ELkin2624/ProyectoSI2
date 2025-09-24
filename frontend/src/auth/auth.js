// src/services/auth.js  (ejemplo)
import api from "../services/api";

export async function registerUser({ username, email, password }) {
  return api.post("auth/register/", { username, email, password });
}
