import { createClient } from './services/http';
import { type Config } from './types';

export const httpPlz = (config: Config) => {
  return createClient(config);
};

export * from './types';
