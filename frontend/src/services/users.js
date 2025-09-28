// src/services/users.js
import api from "./api";

export const searchUsers = (q = "") =>
  api.get("/users/search/", { params: { q } });
