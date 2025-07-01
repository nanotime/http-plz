import { HttpError, type httpResponse } from '../types';

export const request = async <T>(
  url: URL,
  options: RequestInit,
  resolver: (res: Response) => Promise<T>,
): Promise<httpResponse<T>> => {
  const req = fetch(url, options);
  const response: httpResponse<T> = await req;

  if (!response.ok) {
    const clone = response.clone();
    let errorBody: unknown = null;
    try {
      errorBody = await clone.json();
    } catch {
      errorBody = await response.text();
    }

    throw new HttpError(options, response, errorBody);
  }

  response.data = await resolver(response);
  return response;
};
