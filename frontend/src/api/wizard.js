const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadSample(file) {
  const form = new FormData();
  form.append("sample", file);
  const res = await fetch(`${API_URL}/api/upload-sample`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function generateStyle(tempId, requirementsArray) {
  const res = await fetch(`${API_URL}/api/generate-style`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempId, requirements: requirementsArray }),
  });
  return res.json();
}

export async function generateFinal(tempId, file, requirementsObj) {
  const form = new FormData();
  form.append("tempId", tempId);
  form.append("house", file);

  if (requirementsObj) {
    const requirements = Array.isArray(requirementsObj)
      ? requirementsObj
      : Object.values(requirementsObj || {});
    form.append("requirements", JSON.stringify(requirements));
  }

  const res = await fetch(`${API_URL}/api/generate-final`, {
    method: "POST",
    body: form,
  });

  return res.json();
}

export async function getHistories(userId = "") {
  const res = await fetch(`${API_URL}/api/histories?userId=${encodeURIComponent(userId)}`);
  return res.json();
}
