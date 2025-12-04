const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildError(message, fallbackStatus) {
  const error = new Error(message || "Yêu cầu thất bại");
  if (fallbackStatus) {
    error.status = fallbackStatus;
  }
  return error;
}

export async function registerUser({ email, password, name }) {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    throw buildError(data?.message, response.status);
  }

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data?.ok === false) {
    throw buildError(data?.message, response.status);
  }

  return data;
}
