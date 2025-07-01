import { describe, expect, it } from 'vitest';
import { pathFactory } from '../utils/pathFactory';

describe('pathFactory()', () => {
  it('should throw on undefined url', () => {
    expect(() => pathFactory(undefined as unknown as string, '')).toThrow();
  });

  it('should throw on undefined path', () => {
    const url = pathFactory('http://abc.com', undefined as unknown as string);
    expect(url.host).toBe('abc.com');
    expect(pathFactory).toThrow();
  });

  it('should return a valid host and pathname', () => {
    const url = pathFactory('http://abc.com', '/users');
    expect(url.host).toBe('abc.com');
    expect(url.pathname).toBe('/users');
  });
});
