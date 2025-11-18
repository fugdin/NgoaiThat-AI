const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

export async function fetchAdminUsers(params = {}, token = "") {
  const queryString = buildQueryString(params);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/users${queryString}`, {
    method: "GET",
    headers,
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể tải danh sách người dùng";
    throw new Error(message);
  }

  return data;
}
