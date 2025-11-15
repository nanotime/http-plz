import type { Config } from '../types';

export const mergeConfig = (config: Config, newConfig: Partial<Config>): Config => {
  return {
    ...config,
    ...newConfig,
    options: { ...config.options, ...newConfig.options },
    requestMiddleware: newConfig.requestMiddleware ?? config.requestMiddleware,
    responseMiddleware: newConfig.responseMiddleware ?? config.responseMiddleware,
  };
};
