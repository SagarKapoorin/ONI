import axios from "axios";

type ApiErrorResponse = {
  message?: string | string[] | { message?: string | string[] };
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    // console.log("API error response:", error.response);
    const raw = error.response?.data?.message;
    const message =
      typeof raw === "string" || Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object"
          ? (raw).message
          : undefined;

    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(", ");
    }
  } else if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
