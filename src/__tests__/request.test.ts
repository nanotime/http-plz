import { describe, it, expect, vi, beforeEach } from "vitest";
import { request } from "../services/request";

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe("request()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return response with data when request is successful", async () => {
    const mockData = { id: 1, name: "test" };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/users");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver);

    expect(mockFetch).toHaveBeenCalledWith(url, options);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockData);
  });

  it("should throw serialized error when response is not ok", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/users/999");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.json();

    await expect(request(url, options, resolver)).rejects.toThrow(
      JSON.stringify({
        message: "Not Found",
        status: 404,
        data: mockResponse,
      }),
    );

    expect(mockFetch).toHaveBeenCalledWith(url, options);
  });

  it("should handle different HTTP error status codes", async () => {
    const testCases = [
      { status: 400, statusText: "Bad Request" },
      { status: 401, statusText: "Unauthorized" },
      { status: 403, statusText: "Forbidden" },
      { status: 500, statusText: "Internal Server Error" },
    ];

    for (const testCase of testCases) {
      const mockResponse = {
        ok: false,
        status: testCase.status,
        statusText: testCase.statusText,
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      const url = new URL("https://api.example.com/test");
      const options: RequestInit = { method: "GET" };
      const resolver = (res: Response) => res.json();

      await expect(request(url, options, resolver)).rejects.toThrow(
        JSON.stringify({
          message: testCase.statusText,
          status: testCase.status,
          data: mockResponse,
        }),
      );
    }
  });

  it("should work with different resolver functions", async () => {
    const mockTextData = "plain text response";
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue(mockTextData),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/text");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.text();

    const result = await request(url, options, resolver);

    expect(result.data).toBe(mockTextData);
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it("should work with blob resolver", async () => {
    const mockBlob = new Blob(["test"], { type: "text/plain" });
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/file");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.blob();

    const result = await request(url, options, resolver);

    expect(result.data).toBe(mockBlob);
    expect(mockResponse.blob).toHaveBeenCalled();
  });

  it("should handle network errors", async () => {
    const networkError = new Error("Network error");
    mockFetch.mockRejectedValue(networkError);

    const url = new URL("https://api.example.com/users");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.json();

    await expect(request(url, options, resolver)).rejects.toThrow("Network error");
  });

  it("should handle resolver errors", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/users");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.json();

    await expect(request(url, options, resolver)).rejects.toThrow("Invalid JSON");
  });

  it("should pass through request options correctly", async () => {
    const mockData = { success: true };
    const mockResponse = {
      ok: true,
      status: 201,
      statusText: "Created",
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/users");
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
      body: JSON.stringify({ name: "John" }),
    };
    const resolver = (res: Response) => res.json();

    await request(url, options, resolver);

    expect(mockFetch).toHaveBeenCalledWith(url, options);
  });

  it("should preserve response properties", async () => {
    const mockData = { id: 1 };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      url: "https://api.example.com/users",
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const url = new URL("https://api.example.com/users");
    const options: RequestInit = { method: "GET" };
    const resolver = (res: Response) => res.json();

    const result = await request(url, options, resolver);

    expect(result.status).toBe(200);
    expect(result.statusText).toBe("OK");
    expect(result.headers).toBe(mockResponse.headers);
    expect(result.url).toBe("https://api.example.com/users");
    expect(result.data).toEqual(mockData);
  });
});
