export const BACKEND_URL =
  typeof window === "undefined"
    ? "http://backend:8000"
    : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000");

export const API_V1_URL = `${BACKEND_URL}/api/v1`;
