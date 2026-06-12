import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-y7y2.onrender.com/api",
  timeout: 60000,
});

export default api;