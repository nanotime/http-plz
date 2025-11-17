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
  resolver: ((res: Response) => Promise<T>) | null,
  requestMiddlewares: RequestMiddleware[] = [],
  responseMiddlewares: ResponseMiddleware[] = [],
): Promise<httpResponse<T>> => {
  const finalOptions = await runRequestMiddleware(options, requestMiddlewares);
  const response: httpResponse<T> = await fetch(url, finalOptions);

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

  const processingResponse = response.clone();
  const processedByMiddleware = await runResponseMiddleware(
    processingResponse,
    responseMiddlewares,
  );

  let data: T | undefined;
  if (resolver) {
    data = await resolver(processedByMiddleware);
  }

  const finalResponse = new Proxy(processedByMiddleware, {
    get(target, prop) {
      if (prop === 'body') {
        return response.body;
      }
      if (prop === 'bodyUsed') {
        return response.bodyUsed;
      }
      return Reflect.get(target, prop);
    },
  }) as httpResponse<T>;

  finalResponse.data = data;

  return finalResponse;
};
