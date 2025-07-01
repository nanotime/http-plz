# http-plz

A lightweight TypeScript fetch wrapper library that provides quality-of-life improvements including explicit path construction, type-safe query parameters, consistent error formatting, and automatic content handling.

[![npm version](https://badge.fury.io/js/http-plz.svg)](https://badge.fury.io/js/http-plz)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Pipeline](https://github.com/nanotime/http-plz/actions/workflows/ci.yml/badge.svg)](https://github.com/nanotime/http-plz/actions/workflows/ci.yml)
[![Release](https://github.com/nanotime/http-plz/actions/workflows/release.yml/badge.svg)](https://github.com/nanotime/http-plz/actions/workflows/release.yml)

## Features

- 🚀 **Simple API**: Clean and intuitive interface built on top of fetch
- 🔧 **Path Management**: Automatic URL path construction with `pathFactory`
- 🔍 **Query Parameters**: Easy query parameter handling with `queryFactory`
- 📝 **TypeScript Support**: Full TypeScript support with type safety
- 🎯 **Multiple Response Types**: Support for JSON, text, blob, arrayBuffer, and formData
- ⚡ **Lightweight**: Minimal dependencies and small bundle size
- 🔄 **Request Configuration**: Flexible request options and headers management

## Installation

```bash
npm install http-plz
```

```bash
yarn add http-plz
```

```bash
pnpm add http-plz
```

## Quick Start

```typescript
import httpPlz from 'http-plz';

// Create a client instance
const api = httpPlz({
  baseURL: 'https://jsonplaceholder.typicode.com',
  options: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  resolver: 'json', // Default response resolver
});

// Make requests
const users = await api.get({ path: '/users' });
const user = await api.post({
  path: '/users',
  body: { name: 'John Doe', email: 'john@example.com' },
});
```

## API Reference

### Configuration

```typescript
interface Config {
  baseURL: string;
  options?: RequestInit;
  resolver?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
}
```

### Request Options

```typescript
interface RequestOptions {
  path: string;
  query?: { [key: string]: string };
  opts?: Omit<RequestInit, 'method' | 'body'>;
  resolver?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
  body?: unknown;
}
```

### HTTP Methods

All methods return a Promise that resolves to an `httpResponse<T>` object:

```typescript
// GET request
const response = await api.get<User[]>({
  path: '/users',
  query: { page: '1', limit: '10' },
});

// POST request
const response = await api.post<User>({
  path: '/users',
  body: { name: 'Jane Doe', email: 'jane@example.com' },
});

// PUT request
const response = await api.put<User>({
  path: '/users/1',
  body: { name: 'Jane Smith' },
});

// DELETE request
const response = await api.delete({
  path: '/users/1',
});
```

## Usage Examples

### Basic GET Request

```typescript
import httpPlz from 'http-plz';

const api = httpPlz({
  baseURL: 'https://api.example.com',
});

const users = await api.get({
  path: '/users',
});

console.log(users.data); // Response data
console.log(users.status); // HTTP status code
```

### Query Parameters

```typescript
const users = await api.get({
  path: '/users',
  query: {
    page: '1',
    limit: '10',
    sort: 'name',
  },
});
// Requests: https://api.example.com/users?page=1&limit=10&sort=name
```

### POST with Body

```typescript
const newUser = await api.post({
  path: '/users',
  body: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  },
});
```

### Custom Headers and Options

```typescript
const api = httpPlz({
  baseURL: 'https://api.example.com',
  options: {
    headers: {
      'Authorization': 'Bearer your-token',
      'Content-Type': 'application/json',
    },
  },
});

// Override options per request
const response = await api.get({
  path: '/protected-resource',
  opts: {
    headers: {
      'X-Custom-Header': 'custom-value',
    },
    cache: 'no-cache',
  },
});
```

### Different Response Types

```typescript
// JSON response (default)
const jsonData = await api.get({
  path: '/data.json',
  resolver: 'json',
});

// Text response
const textData = await api.get({
  path: '/data.txt',
  resolver: 'text',
});

// Blob response (for files)
const fileBlob = await api.get({
  path: '/file.pdf',
  resolver: 'blob',
});
```

### Error Handling

```typescript
try {
  const response = await api.get({ path: '/users' });
  console.log(response.data);
} catch (error) {
  if (error instanceof HttpError) {
    console.error('Request failed:', {
      status: error.response.status,
      statusText: error.response.statusText,
      body: error.body,
      requestOptions: error.requestOptions,
    });
  }
}
```

## Error Handling

The library provides structured error handling through the `HttpError` class. When a request fails (non-2xx status codes), the library formats the error and throws it for you to handle as needed.

### HttpError Class

```typescript
class HttpError extends Error {
  name: string;
  response: Response;
  body: unknown;
  requestOptions: RequestInit;

  constructor(req: RequestInit, response: Response, body: unknown) {
    super(`HTTP Error: ${response.status} ${response.statusText}`);
    this.name = 'HttpError';
    this.response = response;
    this.body = body;
    this.requestOptions = req;
  }
}
```

### Error Properties

- **`response`**: The original Response object from fetch
- **`body`**: The error response body (parsed as JSON if possible, otherwise as text)
- **`requestOptions`**: The RequestInit options used for the request
- **`message`**: Formatted error message with status code and status text

### Error Handling Examples

```typescript
import { HttpError } from 'http-plz';

try {
  const response = await api.get({ path: '/users/999' });
} catch (error) {
  if (error instanceof HttpError) {
    // Access specific error information
    console.error(`Status: ${error.response.status}`);
    console.error(`Status Text: ${error.response.statusText}`);
    console.error(`Error Body:`, error.body);
    console.error(`Request URL: ${error.response.url}`);

    // Handle specific status codes
    switch (error.response.status) {
      case 404:
        console.error('Resource not found');
        break;
      case 401:
        console.error('Unauthorized - check your credentials');
        break;
      case 500:
        console.error('Server error - try again later');
        break;
      default:
        console.error('Request failed:', error.message);
    }
  }
}
```

The library doesn't perform any automatic error recovery or retries - it simply formats errors consistently and lets you handle them according to your application's needs.

## Request Body and Headers

The library automatically handles request bodies and headers based on the input type, determining the appropriate content type and processing method for each body format.

### Body Processing

The library uses the `processBody` utility to automatically detect and handle different body types:

#### JSON Objects
```typescript
await api.post({
  path: '/users',
  body: { name: 'John', email: 'john@example.com' }
  // Automatically stringified with Content-Type: application/json
});
```

#### FormData
```typescript
const formData = new FormData();
formData.append('name', 'John');
formData.append('file', fileInput);

await api.post({
  path: '/upload',
  body: formData
  // Content-Type: multipart/form-data (set automatically by browser)
});
```

#### URLSearchParams
```typescript
const params = new URLSearchParams();
params.append('name', 'John');
params.append('email', 'john@example.com');

await api.post({
  path: '/form-submit',
  body: params
  // Content-Type: application/x-www-form-urlencoded
});
```

#### String Data
```typescript
await api.post({
  path: '/text',
  body: 'Plain text content'
  // Sent as-is (no automatic Content-Type)
});
```

#### Binary Data (Blob/ArrayBuffer)
```typescript
const blob = new Blob(['binary data'], { type: 'application/octet-stream' });

await api.post({
  path: '/binary',
  body: blob
  // Sent as-is (Content-Type from blob if available)
});
```

### Header Management

Headers are merged in the following priority order (highest to lowest):

1. **Per-request headers** (in `opts.headers`)
2. **Automatic Content-Type** (based on body type)
3. **Base configuration headers** (from `config.options.headers`)

#### Example: Header Precedence
```typescript
const api = httpPlz({
  baseURL: 'https://api.example.com',
  options: {
    headers: {
      'Authorization': 'Bearer token',
      'Content-Type': 'application/json', // Will be overridden
    },
  },
});

await api.post({
  path: '/upload',
  body: formData, // Sets Content-Type: multipart/form-data
  opts: {
    headers: {
      'X-Custom-Header': 'custom-value', // Highest priority
    },
  },
});
// Final headers:
// - Authorization: Bearer token (from base config)
// - Content-Type: multipart/form-data (automatic, overrides base)
// - X-Custom-Header: custom-value (per-request)
```

#### Disabling Automatic Content-Type
```typescript
await api.post({
  path: '/custom',
  body: { data: 'value' },
  opts: {
    headers: {
      'Content-Type': 'application/custom+json', // Override automatic detection
    },
  },
});
```

The library handles content processing transparently - you simply provide the body in the format that makes sense for your use case, and the appropriate headers and encoding are applied automatically.

## Response Object

The library returns an enhanced Response object with an additional `data` property:

```typescript
interface httpResponse<T = unknown> extends Response {
  data?: T;
}
```

## Utilities

### pathFactory

Constructs URLs by combining a base URL with a path:

```typescript
import { pathFactory } from 'http-plz/utils';

const url = pathFactory('https://api.example.com', '/users/123');
// Returns: URL object for 'https://api.example.com/users/123'
```

### queryFactory

Adds query parameters to a URL:

```typescript
import { queryFactory } from 'http-plz/utils';

const url = new URL('https://api.example.com/users');
const urlWithQuery = queryFactory(url, { page: '1', limit: '10' });
// Returns: URL object for 'https://api.example.com/users?page=1&limit=10'
```

## Roadmap

### 🚧 Upcoming Features

- **Middleware System**: Intercept and modify requests and responses
  - Request interceptors for authentication, logging, etc.
  - Response interceptors for data transformation, error handling
  - Configurable middleware pipeline

- **Plugin Architecture**: Extend functionality with plugins (not sure if I'll add all of them, but this architecture opens the possibility to create yours)
  - Authentication plugins (OAuth, JWT, API keys)
  - Caching plugins (in-memory, localStorage, custom)
  - Retry logic plugins with exponential backoff
  - Request/response transformation plugins

- **Built-in Retry Logic**: Configurable retry strategies
- **Request/Response Logging**: Debug and monitoring capabilities

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library
pnpm build

# Lint code
pnpm lint:check

# Format code
pnpm format:check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this library helpful, please consider giving it a ⭐ on GitHub!

For questions, issues, or feature requests, please open an issue on the [GitHub repository](https://github.com/your-username/http-plz).
