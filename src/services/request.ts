import {
  HttpError,
  type httpResponse,
  type RequestMiddleware,
  type ResponseMiddleware,
} from '../types';

const runRequestMiddleware = async (options: RequestInit, middlewares: RequestMiddleware[]) => {
  let processedOptions = options;
  for (const middleware of middlewares) {
    processedOptions = await middleware(processedOptions);
  }
  return processedOptions;
};

const runResponseMiddleware = async (res: Response, middlewares: ResponseMiddleware[]) => {
  let processedResponse = res;
  for (const middleware of [...middlewares].reverse()) {
    processedResponse = await middleware(processedResponse);
  }
  return processedResponse;
};

export const request = async <T>(
  url: URL,
  options: RequestInit,
  resolver: (res: Response) => Promise<T>,
  requestMiddlewares: RequestMiddleware[] = [],
  responseMiddlewares: ResponseMiddleware[] = [],
): Promise<httpResponse<T>> => {
  const finalOptions = await runRequestMiddleware(options, requestMiddlewares);
  let response: httpResponse<T> = await fetch(url, finalOptions);

  const responseForResolver = response.clone();
  response = await runResponseMiddleware(response, responseMiddlewares);

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

  response.data = await resolver(responseForResolver);
  return response;
};
