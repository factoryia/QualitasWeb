import axios from "axios";


const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
  "http://localhost:5030";

export const api = axios.create({
  baseURL: "https://qualitasnexus-web.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
});
