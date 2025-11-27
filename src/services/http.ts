import type { Config, HttpClient, RequestOptions } from '../types';
import { pathFactory } from '../utils/pathFactory';
import { queryFactory } from '../utils/queryFactory';
import { processBody } from '../utils/processBody';
import { request } from './request';
import { merge } from 'es-toolkit';

export const createHttpRequest =
  (config: Config) =>
  async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    { path = '', query = {}, opts = {}, resolver = config.resolver, body }: RequestOptions,
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

    return request<T>(
      url,
      reqConfig,
      resolver ? (res: Response) => res[resolver]() : null,
      config.requestMiddleware || [],
      config.responseMiddleware || [],
    );

    // if (resolver) {
    //   const reqResolver = (res: Response) => res[resolver]();
    //   return request<T>(
    //     url,
    //     reqConfig,
    //     reqResolver,
    //     config.requestMiddleware || [],
    //     config.responseMiddleware || [],
    //   );
    // }

    // return request<T>(
    //   url,
    //   reqConfig,
    //   null,
    //   config.requestMiddleware || [],
    //   config.responseMiddleware || [],
    // );
  };

export const createClient = (config: Config): HttpClient => {
  const httpMethod = createHttpRequest(config);

  const client: HttpClient = {
    get: <T>(options: RequestOptions) => httpMethod<T>('GET', options),
    post: <T>(options: RequestOptions) => httpMethod<T>('POST', options),
    put: <T>(options: RequestOptions) => httpMethod<T>('PUT', options),
    patch: <T>(options: RequestOptions) => httpMethod<T>('PATCH', options),
    delete: <T>(options: RequestOptions) => httpMethod<T>('DELETE', options),
    clone: (newConfig: Partial<Config>) => {
      const merged = merge(config, newConfig);
      return createClient(merged);
    },
  };

  return client;
};
