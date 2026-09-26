const BASE_URL = "http://localhost:5000";

export const api = async <T = any>(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
): Promise<T> => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("NON-JSON RESPONSE:", text);
      throw new Error("Server returned invalid response");
    }

    if (!res.ok) {
      throw new Error(data?.message || "Request failed");
    }

    return data as T;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};