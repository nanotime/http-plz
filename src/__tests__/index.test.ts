import { describe, it, expect, vi, beforeEach } from "vitest";
import httpPlz from "../index";
import { createClient } from "../services/http";
import type { Config } from "../types";

// Mock the http service
vi.mock("../services/http");

const mockCreateClient = vi.mocked(createClient);

describe("httpPlz Main Export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export a function", () => {
    expect(typeof httpPlz).toBe("function");
  });

  it("should call createClient with provided config", () => {
    const mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    mockCreateClient.mockReturnValue(mockClient);

    const config: Config = {
      baseURL: "https://api.example.com",
      options: {
        headers: { "Content-Type": "application/json" },
      },
      resolver: "json",
    };

    const result = httpPlz(config);

    expect(mockCreateClient).toHaveBeenCalledWith(config);
    expect(result).toBe(mockClient);
  });

  it("should work with minimal config", () => {
    const mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    mockCreateClient.mockReturnValue(mockClient);

    const minimalConfig: Config = {
      baseURL: "https://api.example.com",
    };

    const result = httpPlz(minimalConfig);

    expect(mockCreateClient).toHaveBeenCalledWith(minimalConfig);
    expect(result).toBe(mockClient);
  });

  it("should return the client created by createClient", () => {
    const expectedClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    mockCreateClient.mockReturnValue(expectedClient);

    const config: Config = {
      baseURL: "https://api.example.com",
    };

    const actualClient = httpPlz(config);

    expect(actualClient).toBe(expectedClient);
  });
});
