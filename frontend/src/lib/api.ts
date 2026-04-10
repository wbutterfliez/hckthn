//const BASE_URL = "http://localhost:5000/api";
const BASE_URL = "http://127.0.0.1:5000/api";
export const api = async (
  endpoint: string,
  method = "GET",
  body?: any,
  token?: string
) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response:", text);
    throw new Error("API did not return JSON");
  }
};