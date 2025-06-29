import type { Query } from "../types";

export const queryFactory = (url: URL, params: Query) => {
  const newUrl = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    newUrl.searchParams.set(key, value);
  }
  return newUrl;
};
