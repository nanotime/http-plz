export function processBody(body: unknown): { processedBody: BodyInit; contentType?: string } {
  if (body instanceof FormData) {
    return { processedBody: body };
  }

  if (body instanceof URLSearchParams) {
    return {
      processedBody: body,
      contentType: 'application/x-www-form-urlencoded',
    };
  }

  if (typeof body === 'string') {
    return { processedBody: body };
  }

  if (body instanceof Blob) {
    return { processedBody: body };
  }

  if (body instanceof ArrayBuffer) {
    return { processedBody: body };
  }

  if (ArrayBuffer.isView(body) && body.buffer instanceof ArrayBuffer) {
    return { processedBody: body as ArrayBufferView<ArrayBuffer> };
  }

  return {
    processedBody: JSON.stringify(body),
    contentType: 'application/json',
  };
}
