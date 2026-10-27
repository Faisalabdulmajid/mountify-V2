// API helper for search history (backend)
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;


export async function saveSearchHistoryBackend({ searchTerm, filters, token }) {
  return axios.post(
    `${API_BASE_URL}/api/search-history`,
    { searchTerm, filters },
    {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
}


export async function getSearchHistoryBackend(token) {
  const res = await axios.get(`${API_BASE_URL}/api/search-history`, {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}
