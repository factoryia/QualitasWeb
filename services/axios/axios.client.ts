import axios from "axios";

export const api = axios.create({
  baseURL: "https://qualitasnexus-web.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
});
