import { describe, it, expect } from 'vitest';
import { queryFactory } from '../utils/queryFactory';

describe('queryFactory', () => {
  it('should throw on undefined url', () => {
    expect(() => queryFactory(undefined as unknown as URL, {})).toThrow();
  });

  it('should return a new url instance with correct host and query', () => {
    const url = queryFactory(new URL('http://localhost:3000'), {
      foo: 'bar',
      qu: 'qaz',
    });
    expect(url).instanceOf(URL);
    expect(url.host).toBe('localhost:3000');
    expect(url.searchParams.get('foo')).toBe('bar');
    expect(url.searchParams.get('qu')).toBe('qaz');
  });
});
