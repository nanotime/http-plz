import type { Config, RequestOptions } from "../types";
import { pathFactory } from "../utils/pathFactory";
import { queryFactory } from "../utils/queryFactory";
import { request } from "./request";

export const createHttpRequest =
  (config: Config) =>
  async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    {
      path = "",
      query = {},
      opts = {},
      resolver = config.resolver || "json",
      body,
    }: RequestOptions,
  ) => {
    let url = pathFactory(config.baseURL, path);
    if (Object.keys(query).length) url = queryFactory(url, query);

    const reqConfig: RequestInit = {
      ...config.options,
      ...opts,
      method,
    };

    if (body) reqConfig.body = JSON.stringify(body);

    const reqResolver = (res: Response) => res[resolver]();
    return request<T>(url, reqConfig, reqResolver);
  };

export const createClient = (config: Config) => {
  const httpMethod = createHttpRequest(config);

  return {
    get: <T>(options: RequestOptions) => httpMethod<T>("GET", options),
    post: <T>(options: RequestOptions) => httpMethod<T>("POST", options),
    put: <T>(options: RequestOptions) => httpMethod<T>("PUT", options),
    patch: <T>(options: RequestOptions) => httpMethod<T>("PATCH", options),
    delete: <T>(options: RequestOptions) => httpMethod<T>("DELETE", options),
  };
};
