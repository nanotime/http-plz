import type { Config, HttpClient, RequestOptions } from '../types';
import { pathFactory } from '../utils/pathFactory';
import { queryFactory } from '../utils/queryFactory';
import { processBody } from '../utils/processBody';
import { request } from './request';
import { merge } from 'es-toolkit';

export const createHttpRequest =
  (config: Config) =>
  async <R, B = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    { path = '', query = {}, opts = {}, resolver = config.resolver, body }: RequestOptions<B>,
  ) => {
    let url = pathFactory(config.baseURL, path);
    if (Object.keys(query).length) url = queryFactory(url, query);

    const reqConfig: RequestInit = {
      ...config.options,
      ...opts,
      method,
    };

    if (body != null) {
      const { processedBody, contentType } = processBody(body);
      reqConfig.body = processedBody;

      reqConfig.headers = {
        ...(contentType && { 'Content-Type': contentType }),
        ...reqConfig.headers,
        ...opts.headers,
      };
    }

    return request<R>(
      url,
      reqConfig,
      resolver ? (res: Response) => res[resolver]() : null,
      config.requestMiddleware || [],
      config.responseMiddleware || [],
    );
  };

export const createClient = (config: Config): HttpClient => {
  const httpMethod = createHttpRequest(config);

  const client: HttpClient = {
    get: <T>(options: RequestOptions) => httpMethod<T>('GET', options),
    post: <T, B = unknown>(options: RequestOptions<B>) => httpMethod<T, B>('POST', options),
    put: <T, B = unknown>(options: RequestOptions<B>) => httpMethod<T, B>('PUT', options),
    patch: <T, B = unknown>(options: RequestOptions<B>) => httpMethod<T, B>('PATCH', options),
    delete: <T>(options: RequestOptions) => httpMethod<T>('DELETE', options),
    clone: (newConfig: Partial<Config>) => {
      const merged = merge(config, newConfig);
      return createClient(merged);
    },
  };

  return client;
};
