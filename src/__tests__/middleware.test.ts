import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from '../services/request';
import type { RequestMiddleware, ResponseMiddleware } from '../types';

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

const createMockResponse = (baseResponse: Partial<Response>) => {
  const mockResponse = {
    ...baseResponse,
    clone: vi.fn(),
  } as unknown as Response;

  (mockResponse.clone as any).mockReturnValue({
    ...baseResponse,
    clone: vi.fn(),
  });

  return mockResponse;
};

describe('Request Middlewares', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute request middlewares in sequential order', async () => {
    const executionOrder: string[] = [];

    const middleware1: RequestMiddleware = async (options) => {
      executionOrder.push('middleware1');
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Middleware-1': 'executed',
        },
      };
    };

    const middleware2: RequestMiddleware = async (options) => {
      executionOrder.push('middleware2');
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Middleware-2': 'executed',
        },
      };
    };

    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await request(url, options, resolver, [middleware1, middleware2]);

    expect(executionOrder).toEqual(['middleware1', 'middleware2']);
    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: {
          'X-Middleware-1': 'executed',
          'X-Middleware-2': 'executed',
        },
      }),
    );
  });

  it('should accumulate modifications from multiple request middlewares', async () => {
    const addAuthMiddleware: RequestMiddleware = async (options) => ({
      ...options,
      headers: {
        ...options.headers,
        Authorization: 'Bearer token123',
      },
    });

    const addUserAgentMiddleware: RequestMiddleware = async (options) => ({
      ...options,
      headers: {
        ...options.headers,
        'User-Agent': 'MyApp/1.0',
      },
    });

    const addCacheMiddleware: RequestMiddleware = async (options) => ({
      ...options,
      cache: 'no-cache' as RequestCache,
    });

    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await request(url, options, resolver, [
      addAuthMiddleware,
      addUserAgentMiddleware,
      addCacheMiddleware,
    ]);

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token123',
          'User-Agent': 'MyApp/1.0',
        },
        cache: 'no-cache',
      }),
    );
  });

  it('should handle async request middlewares', async () => {
    const asyncMiddleware: RequestMiddleware = async (options) => {
      // Simulate async operation (e.g., fetching token)
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Async-Token': 'async-value',
        },
      };
    };

    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await request(url, options, resolver, [asyncMiddleware]);

    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: {
          'X-Async-Token': 'async-value',
        },
      }),
    );
  });

  it('should stop execution when request middleware throws error', async () => {
    const middleware1: RequestMiddleware = async (options) => {
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Middleware-1': 'executed',
        },
      };
    };

    const errorMiddleware: RequestMiddleware = async () => {
      throw new Error('Middleware authentication failed');
    };

    const middleware3: RequestMiddleware = async (options) => {
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Middleware-3': 'should-not-execute',
        },
      };
    };

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await expect(
      request(url, options, resolver, [middleware1, errorMiddleware, middleware3]),
    ).rejects.toThrow('Middleware authentication failed');

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('Response Middlewares', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute response middlewares in reverse order', async () => {
    const executionOrder: string[] = [];

    const middleware1: ResponseMiddleware = async (response) => {
      executionOrder.push('middleware1');
      return response;
    };

    const middleware2: ResponseMiddleware = async (response) => {
      executionOrder.push('middleware2');
      return response;
    };

    const middleware3: ResponseMiddleware = async (response) => {
      executionOrder.push('middleware3');
      return response;
    };

    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await request(url, options, resolver, [], [middleware1, middleware2, middleware3]);

    expect(executionOrder).toEqual(['middleware3', 'middleware2', 'middleware1']);
  });

  it('should allow response middlewares to transform the response', async () => {
    const addHeaderMiddleware: ResponseMiddleware = async (response) => {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Processed', 'true');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const mockResponseBody = JSON.stringify({ success: true });
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    // Mock clone to return a fresh response with the same body
    (mockResponse.clone as any).mockReturnValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
      clone: vi.fn(),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver, [], [addHeaderMiddleware]);

    expect(result.headers.get('X-Processed')).toBe('true');
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle async response middlewares', async () => {
    const asyncResponseMiddleware: ResponseMiddleware = async (response) => {
      // Simulate async processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Async-Processed', 'true');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const mockResponseBody = JSON.stringify({ success: true });
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    // Mock clone to return a fresh response with the same body
    (mockResponse.clone as any).mockReturnValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
      clone: vi.fn(),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver, [], [asyncResponseMiddleware]);

    expect(result.headers.get('X-Async-Processed')).toBe('true');
  });

  it('should stop execution when response middleware throws error', async () => {
    const middleware1: ResponseMiddleware = async (response) => {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Middleware-1', 'executed');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const errorMiddleware: ResponseMiddleware = async () => {
      throw new Error('Response processing failed');
    };

    const middleware3: ResponseMiddleware = async (response) => {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Middleware-3', 'should-not-execute');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    await expect(
      request(url, options, resolver, [], [middleware1, errorMiddleware, middleware3]),
    ).rejects.toThrow('Response processing failed');
  });
});

describe('Middleware Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute both request and response middlewares in correct order', async () => {
    const executionOrder: string[] = [];

    const requestMiddleware: RequestMiddleware = async (options) => {
      executionOrder.push('request-middleware');
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-Request': 'processed',
        },
      };
    };

    const responseMiddleware: ResponseMiddleware = async (response) => {
      executionOrder.push('response-middleware');
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Response', 'processed');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const mockResponseBody = JSON.stringify({ success: true });
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    // Mock clone to return a fresh response with the same body
    (mockResponse.clone as any).mockReturnValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(mockResponseBody),
      json: vi.fn().mockResolvedValue({ success: true }),
      clone: vi.fn(),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver, [requestMiddleware], [responseMiddleware]);

    expect(executionOrder).toEqual(['request-middleware', 'response-middleware']);
    expect(mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: {
          'X-Request': 'processed',
        },
      }),
    );
    expect(result.headers.get('X-Response')).toBe('processed');
  });

  it('should work with empty middleware arrays', async () => {
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL('https://api.example.com/test');
    const options: RequestInit = { method: 'GET' };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver, [], []);

    expect(mockFetch).toHaveBeenCalledWith(url, options);
    expect(result.data).toEqual({ success: true });
  });
});
