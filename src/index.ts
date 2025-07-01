import { createClient } from './services/http';
import { type Config } from './types';

const httpPlz = (config: Config) => {
  return createClient(config);
};

export * from './types';
export default httpPlz;
