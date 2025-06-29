import type { httpResponse } from "../types";

export const request = async <T>(
  url: URL,
  options: RequestInit,
  resolver: (res: Response) => Promise<T>,
): Promise<httpResponse<T>> => {
  const response: httpResponse<T> = await fetch(url, options);

  if (!response.ok) {
    const serializedError = JSON.stringify({
      message: response.statusText,
      status: response.status,
      data: response,
    });
    throw new Error(serializedError);
  }

  response.data = await resolver(response);
  return response;
};
