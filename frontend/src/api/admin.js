// frontend/src/api/admin.js
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
  } catch {
    return null;
  }
};

const buildHeaders = (token = "") => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// 1) API admin users
export async function fetchAdminUsers(params = {}, token = "") {
  const queryString = buildQueryString(params);

  const response = await fetch(`${API_URL}/api/admin/users${queryString}`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    const message =
      data?.message || "Không thể tải danh sách người dùng";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data; // { ok, data }
}

// 2) API admin stats
export async function fetchAdminStats(token = "") {
  const response = await fetch(`${API_URL}/api/admin/stats`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể tải thống kê admin";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data; // { ok, totalUsers, ... }
}

// 3) API admin generations (cho dashboard)
export async function fetchAdminGenerations(params = {}, token = "") {
  const queryString = buildQueryString(params);

  const response = await fetch(
    `${API_URL}/api/admin/generations${queryString}`,
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    const message =
      data?.message || "Không thể tải danh sách lượt sinh ảnh (generations)";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data; // { ok, page, pageSize, total, items }
}

// 4) Tổng hợp lượt sinh ảnh theo user
export async function fetchGenerationsByUser(params = {}, token = "") {
  const queryString = buildQueryString(params);
  const response = await fetch(
    `${API_URL}/api/admin/generations/by-user${queryString}`,
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );
  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    const message =
      data?.message || "Không thể tải thống kê lượt sinh theo tài khoản";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// 5) Xóa 1 generation (admin)
export async function deleteAdminGeneration(id, token = "") {
  const response = await fetch(`${API_URL}/api/admin/generations/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể xóa bản ghi generate";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

// 6) Tạo user mới (admin)
export async function createAdminUser(payload = {}, token = "") {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể tạo tài khoản mới";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

// 7) Cập nhật user (email / role / password)
export async function updateAdminUser(id, payload = {}, token = "") {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể cập nhật tài khoản";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

// 8) Xóa user
export async function deleteAdminUser(id, token = "") {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || data?.ok === false) {
    const message = data?.message || "Không thể xóa tài khoản";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}
