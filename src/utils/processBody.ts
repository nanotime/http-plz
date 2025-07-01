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

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return { processedBody: body };
  }

  return {
    processedBody: JSON.stringify(body),
    contentType: 'application/json',
  };
}
