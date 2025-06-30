import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHttpRequest, createClient } from "../services/http";
import { pathFactory } from "../utils/pathFactory";
import { queryFactory } from "../utils/queryFactory";
import { request } from "../services/request";
import type { Config, RequestOptions } from "../types";

// Mock dependencies
vi.mock("../utils/pathFactory");
vi.mock("../utils/queryFactory");
vi.mock("../services/request");

const mockPathFactory = vi.mocked(pathFactory);
const mockQueryFactory = vi.mocked(queryFactory);
const mockRequest = vi.mocked(request);

describe("createHttpRequest", () => {
  const mockConfig: Config = {
    baseURL: "https://api.example.com",
    options: {
      headers: { "Content-Type": "application/json" },
    },
    resolver: "json",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockPathFactory.mockReturnValue(new URL("https://api.example.com/test"));
    mockQueryFactory.mockReturnValue(new URL("https://api.example.com/test?param=value"));
    mockRequest.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    } as any);
  });

  it("should call queryFactory only when query parameters are provided", async () => {
    const httpRequest = createHttpRequest(mockConfig);

    // Test with query parameters
    await httpRequest("GET", {
      path: "/users",
      query: { page: "1" },
      opts: {},
      body: undefined,
    });
    expect(mockQueryFactory).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    mockPathFactory.mockReturnValue(new URL("https://api.example.com/test"));

    // Test without query parameters
    await httpRequest("GET", {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    });
    expect(mockQueryFactory).not.toHaveBeenCalled();
  });

  it("should merge config options with request options correctly", async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {
        headers: { Authorization: "Bearer token123" },
        cache: "no-cache",
      },
      body: undefined,
    };

    await httpRequest("POST", options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
        }),
        cache: "no-cache",
        method: "POST",
      }),
      expect.any(Function),
    );
  });

  it("should serialize body as JSON when provided", async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const requestBody = { name: "John", email: "john@example.com" };
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: requestBody,
    };

    await httpRequest("POST", options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        body: JSON.stringify(requestBody),
        method: "POST",
      }),
      expect.any(Function),
    );
  });

  it("should not add body to request config when body is undefined", async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    await httpRequest("GET", options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.not.objectContaining({
        body: expect.anything(),
      }),
      expect.any(Function),
    );
  });

  it("should pass correct HTTP method to request", async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    const methods = ["GET", "POST", "PUT", "DELETE"] as const;

    for (const method of methods) {
      await httpRequest(method, options);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({ method }),
        expect.any(Function),
      );
    }
  });

  it("should return the result from request function", async () => {
    const expectedResult = {
      ok: true,
      status: 200,
      data: { id: 1, name: "John" },
    };
    mockRequest.mockResolvedValue(expectedResult as any);

    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    const result = await httpRequest("GET", options);

    expect(result).toBe(expectedResult);
  });

  it("should handle config without options", async () => {
    const minimalConfig: Config = {
      baseURL: "https://api.example.com",
    };

    const httpRequest = createHttpRequest(minimalConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    await httpRequest("GET", options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "GET",
      }),
      expect.any(Function),
    );
  });

  it("should not add body to request config when body is null", async () => {
    const httpRequest = createHttpRequest(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: null,
    };

    await httpRequest("POST", options);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.not.objectContaining({
        body: expect.anything(),
      }),
      expect.any(Function),
    );
  });
});

describe("createClient", () => {
  const mockConfig: Config = {
    baseURL: "https://api.example.com",
    options: {},
    resolver: "json",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockPathFactory.mockReturnValue(new URL("https://api.example.com/test"));
    mockRequest.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    } as any);
  });

  it("should create client with all HTTP methods", () => {
    const client = createClient(mockConfig);

    expect(client).toHaveProperty("get");
    expect(client).toHaveProperty("post");
    expect(client).toHaveProperty("put");
    expect(client).toHaveProperty("patch");
    expect(client).toHaveProperty("delete");
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.put).toBe("function");
    expect(typeof client.patch).toBe("function");
    expect(typeof client.delete).toBe("function");
  });

  it("should call underlying httpMethod with correct HTTP methods", async () => {
    const client = createClient(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    await client.get(options);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: "GET" }),
      expect.any(Function),
    );

    await client.post({ ...options, body: { name: "John" } });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: "POST" }),
      expect.any(Function),
    );

    await client.put({ ...options, body: { name: "John Updated" } });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: "PUT" }),
      expect.any(Function),
    );

    await client.delete(options);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: "DELETE" }),
      expect.any(Function),
    );
  });

  it("should return the result from httpMethod", async () => {
    const expectedResult = {
      ok: true,
      status: 200,
      data: [{ id: 1, name: "John" }],
    };
    mockRequest.mockResolvedValue(expectedResult as any);

    const client = createClient(mockConfig);
    const options: RequestOptions = {
      path: "/users",
      query: {},
      opts: {},
      body: undefined,
    };

    const result = await client.get(options);

    expect(result).toBe(expectedResult);
  });
});
