export const pathFactory = (baseURL: string, path: string) => {
  const url = new URL(baseURL);
  url.pathname = path;
  return url;
};
