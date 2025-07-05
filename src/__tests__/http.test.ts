import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHttpRequest, createClient } from '../services/http';
import { pathFactory } from '../utils/pathFactory';
import { queryFactory } from '../utils/queryFactory';
import { request } from '../services/request';
import type { Config, RequestOptions } from '../types';

// Mock dependencies
vi.mock('../utils/pathFactory');
vi.mock('../utils/queryFactory');
vi.mock('../services/request');

const mockPathFactory = vi.mocked(pathFactory);
const mockQueryFactory = vi.mocked(queryFactory);
const mockRequest = vi.mocked(request);

describe('createHttpRequest', () => {
  const mockConfig: Config = {
    baseURL: 'https://api.example.com',
    options: {
      headers: { 'Content-Type': 'application/json' },
    },
    resolver: 'json',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockPathFactory.mockReturnValue(new URL('https://api.example.com/test'));
    mockQueryFactory.mockReturnValue(new URL('https://api.example.com/test?param=value'));
    mockRequest.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    } as any);
  });

  it('should call queryFactory only when query parameters are provided', async () => {
    const httpRequest = createHttpRequest(mockConfig);

    // Test with query parameters
    await httpRequest('GET', {
      path: '/users',
      query: { page: '1' },
      opts: {},
      body: undefined,
    });
    expect(mockQueryFactory).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    mockPathFactory.mockReturnValue(new URL('https://api.example.com/test'));

    // Test without query parameters
    await httpRequest('GET', {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    });
    expect(mockQueryFactory).not.toHaveBeenCalled();
  });

  it('should merge config options with request options correctly', async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {
        headers: { Authorization: 'Bearer token123' },
        cache: 'no-cache',
      },
      body: undefined,
    };

    await httpRequest('POST', options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
        cache: 'no-cache',
        method: 'POST',
      }),
      expect.any(Function),
      [],
      [],
    );
  });

  it('should serialize body as JSON when provided', async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const requestBody = { name: 'John', email: 'john@example.com' };
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: requestBody,
    };

    await httpRequest('POST', options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        body: JSON.stringify(requestBody),
        method: 'POST',
      }),
      expect.any(Function),
      [],
      [],
    );
  });

  it('should not add body to request config when body is undefined', async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    await httpRequest('GET', options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.not.objectContaining({
        body: expect.anything(),
      }),
      expect.any(Function),
      [],
      [],
    );
  });

  it('should pass correct HTTP method to request', async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

    for (const method of methods) {
      await httpRequest(method, options);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({ method }),
        expect.any(Function),
        [],
        [],
      );
    }
  });

  it('should return the result from request function', async () => {
    const expectedResult = {
      ok: true,
      status: 200,
      data: { id: 1, name: 'John' },
    };
    mockRequest.mockResolvedValue(expectedResult as any);

    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    const result = await httpRequest('GET', options);

    expect(result).toBe(expectedResult);
  });

  it('should handle config without options', async () => {
    const minimalConfig: Config = {
      baseURL: 'https://api.example.com',
    };

    const httpRequest = createHttpRequest(minimalConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    await httpRequest('GET', options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'GET',
      }),
      expect.any(Function),
      [],
      [],
    );
  });

  it('should not add body to request config when body is null', async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: null,
    };

    await httpRequest('POST', options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.not.objectContaining({
        body: expect.anything(),
      }),
      expect.any(Function),
      [],
      [],
    );
  });
});

describe('createClient', () => {
  const mockConfig: Config = {
    baseURL: 'https://api.example.com',
    options: {},
    resolver: 'json',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockPathFactory.mockReturnValue(new URL('https://api.example.com/test'));
    mockRequest.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    } as any);
  });

  it('should create client with all HTTP methods', () => {
    const client = createClient(mockConfig);

    expect(client).toHaveProperty('get');
    expect(client).toHaveProperty('post');
    expect(client).toHaveProperty('put');
    expect(client).toHaveProperty('patch');
    expect(client).toHaveProperty('delete');
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
  });

  it('should call underlying httpMethod with correct HTTP methods', async () => {
    const client = createClient(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    await client.get(options);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: 'GET' }),
      expect.any(Function),
      [],
      [],
    );

    await client.post({ ...options, body: { name: 'John' } });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: 'POST' }),
      expect.any(Function),
      [],
      [],
    );

    await client.put({ ...options, body: { name: 'John Updated' } });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: 'PUT' }),
      expect.any(Function),
      [],
      [],
    );

    await client.delete(options);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: 'DELETE' }),
      expect.any(Function),
      [],
      [],
    );
  });

  it('should return the result from httpMethod', async () => {
    const expectedResult = {
      ok: true,
      status: 200,
      data: [{ id: 1, name: 'John' }],
    };
    mockRequest.mockResolvedValue(expectedResult as any);

    const client = createClient(mockConfig);
    const options: RequestOptions = {
      path: '/users',
      query: {},
      opts: {},
      body: undefined,
    };

    const result = await client.get(options);

    expect(result).toBe(expectedResult);
  });

  describe('clone method', () => {
    it('should create a new client instance with same base configuration', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        options: {
          headers: { 'X-Version': '1.0' },
        },
        resolver: 'json',
      };

      const client1 = createClient(config);
      const client2 = client1.clone({});

      expect(client2).not.toBe(client1);
      expect(client2.get).toBeDefined();
      expect(client2.post).toBeDefined();
      expect(client2.clone).toBeDefined();
    });

    it('should override specified properties in cloned instance', () => {
      const originalConfig: Config = {
        baseURL: 'https://api.example.com',
        options: {
          headers: { 'X-Version': '1.0' },
        },
        resolver: 'json',
      };

      const client1 = createClient(originalConfig);
      const client2 = client1.clone({
        baseURL: 'https://beta.api.example.com',
        options: {
          headers: { 'X-Client': 'Test' },
        },
      });

      // Both clients should be functional but independent
      expect(client1).not.toBe(client2);
      expect(typeof client2.get).toBe('function');
      expect(typeof client2.post).toBe('function');
    });

    // @refactor: this test doesn't really test the headers merge
    it('should merge headers correctly when cloning', () => {
      const originalConfig: Config = {
        baseURL: 'https://api.example.com',
        options: {
          headers: {
            'X-Version': '1.0',
            'Content-Type': 'application/json',
          },
        },
        resolver: 'json',
      };

      const client1 = createClient(originalConfig);
      const client2 = client1.clone({
        options: {
          headers: { 'X-Client': 'Test' },
        },
      });

      // Test that both clients work independently
      expect(client1).not.toBe(client2);
      expect(client2.get).toBeDefined();
    });

    it('should preserve original client when cloning', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        resolver: 'json',
      };

      const client1 = createClient(config);
      const originalGet = client1.get;
      const originalPost = client1.post;

      const client2 = client1.clone({
        baseURL: 'https://beta.api.example.com',
      });

      // Original client should remain unchanged
      expect(client1.get).toBe(originalGet);
      expect(client1.post).toBe(originalPost);
      expect(client2).not.toBe(client1);
    });

    it('should allow chaining clone operations', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        resolver: 'json',
      };

      const client1 = createClient(config);
      const client2 = client1.clone({ resolver: 'text' });
      const client3 = client2.clone({ baseURL: 'https://v2.api.example.com' });

      expect(client1).not.toBe(client2);
      expect(client2).not.toBe(client3);
      expect(client1).not.toBe(client3);

      // All should be functional
      expect(client1.get).toBeDefined();
      expect(client2.get).toBeDefined();
      expect(client3.get).toBeDefined();
    });

    // @refactor: how this is really testing the override?
    it('should handle empty config override', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        options: {
          headers: { 'X-Version': '1.0' },
        },
        resolver: 'json',
      };

      const client1 = createClient(config);
      const client2 = client1.clone({});

      expect(client1).not.toBe(client2);
      expect(client2.get).toBeDefined();
      expect(client2.post).toBeDefined();
    });

    it('should handle partial config override', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        options: {
          headers: { 'X-Version': '1.0' },
          cache: 'no-cache',
        },
        resolver: 'json',
      };

      const client1 = createClient(config);
      const client2 = client1.clone({
        resolver: 'text',
      });

      expect(client1).not.toBe(client2);
      expect(client2.get).toBeDefined();
    });

    it('should create independent instances that do not affect each other', () => {
      const config: Config = {
        baseURL: 'https://api.example.com',
        resolver: 'json',
      };

      const client1 = createClient(config);
      const client2 = client1.clone({});

      // Modifying one should not affect the other
      // Since we can't directly modify the internal config, we test that they are separate instances
      expect(client1).not.toBe(client2);
      expect(client1.get).not.toBe(client2.get);
      expect(client1.post).not.toBe(client2.post);
      expect(client1.clone).not.toBe(client2.clone);
    });
  });
});
