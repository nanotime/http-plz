import { HttpError, type httpResponse } from "../types";

export const request = async <T>(
  url: URL,
  options: RequestInit,
  resolver: (res: Response) => Promise<T>,
): Promise<httpResponse<T>> => {
  const response: httpResponse<T> = await fetch(url, options);

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    throw new HttpError(response, errorBody);
  }

  response.data = await resolver(response);
  return response;
};
