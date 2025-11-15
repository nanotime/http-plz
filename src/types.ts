export type HttpClient = {
  get: <T>(options: RequestOptions) => Promise<httpResponse<T>>;
  post: <T>(options: RequestOptions) => Promise<httpResponse<T>>;
  put: <T>(options: RequestOptions) => Promise<httpResponse<T>>;
  patch: <T>(options: RequestOptions) => Promise<httpResponse<T>>;
  delete: <T>(options: RequestOptions) => Promise<httpResponse<T>>;
  clone: (newConfig: Partial<Config>) => HttpClient;
};

export type Resolver = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
export type Query = { [key: string]: string };

export type RequestOptions = {
  path: string;
  query?: Query;
  opts?: Omit<RequestInit, 'method' | 'body'>;
  resolver?: Resolver;
  body?: unknown;
};

export interface QueryParam {
  params: Query;
  url: URL;
}

export interface httpResponse<T = unknown> extends Response {
  data?: T;
}
export type RequestMiddleware = (req: RequestInit) => Promise<RequestInit>;
export type ResponseMiddleware = (res: Response) => Promise<Response>;
export interface Config {
  baseURL: string;
  options?: RequestInit;
  resolver?: Resolver;
  requestMiddleware?: RequestMiddleware[];
  responseMiddleware?: ResponseMiddleware[];
}

export class HttpError extends Error {
  name: string;
  response: Response;
  body: unknown;
  requestOptions: RequestInit;

  constructor(req: RequestInit, response: Response, body: unknown) {
    super(`HTTP Error: ${response.status} ${response.statusText}`);

    this.name = 'HttpError';
    this.response = response;
    this.body = body;
    this.requestOptions = req;
  }
}
