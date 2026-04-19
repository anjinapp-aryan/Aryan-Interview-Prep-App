/**
 * Ensure the base URL does not have a trailing slash.
 * Fallback to localhost if the environment variable is missing.
 */
const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
  return url.replace(/\/+$/, "");
};

export const BASE_URL = getBaseUrl();

export const evaluateInterview = async (question: string, answer: string) => {
  const response = await fetch(`${BASE_URL}/api/interview/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, answer }),
  });

  return response;
};
