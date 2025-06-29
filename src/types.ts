export type Resolver = "json" | "text" | "blob" | "arrayBuffer" | "formData";
export type Query = { [key: string]: string };

export type RequestOptions = {
  path: string;
  query?: Query;
  opts?: Omit<RequestInit, "method" | "body">;
  resolver?: Resolver;
  body: unknown;
};

export interface QueryParam {
  params: Query;
  url: URL;
}

export interface httpResponse<T = unknown> extends Response {
  data?: T;
}

export interface Config {
  baseURL: string;
  options?: RequestInit;
  resolver?: Resolver;
}
