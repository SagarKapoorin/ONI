import axios from "axios";

type ApiErrorResponse = {
  message?: string | string[];
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    // console.log("API error response:", error.response);
    const message = error.response?.data?.message;
    if (message) {
      // console.log("API error message:", message);
      if (Array.isArray(message)) {
        return message.join(", ");
      }
      return message;
    }
  } else if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
