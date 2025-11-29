export const pathFactory = (baseURL: string, path: string) => {
  const url = new URL(baseURL);
  console.log('base pathname', url.pathname);
  url.pathname = url.pathname === '/' ? path : `${url.pathname}${path}`;
  console.log('new pathname', url.pathname);
  return url;
};
