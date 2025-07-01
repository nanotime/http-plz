import { describe, expect, test as it } from 'vitest';
import { processBody } from '../utils/processBody';

describe('processBody', () => {
  it('FormData should return body without Content-Type', () => {
    const formData = new FormData();
    formData.append('field', 'value');

    const result = processBody(formData);
    expect(result.processedBody).toBeInstanceOf(FormData);
    expect(result.contentType).toBeUndefined();
  });

  it('URLSearchParams should return application/x-www-form-urlencoded', () => {
    const params = new URLSearchParams({ key: 'value' });

    const result = processBody(params);
    expect(result.processedBody).toBe(params);
    expect(result.contentType).toBe('application/x-www-form-urlencoded');
  });

  it('Objects should be converted to JSON with application/json', () => {
    const obj = { name: 'John' };

    const result = processBody(obj);
    expect(result.processedBody).toBe(JSON.stringify(obj));
    expect(result.contentType).toBe('application/json');
  });

  it('Strings should be passed through without Content-Type', () => {
    const text = 'plain text';

    const result = processBody(text);
    expect(result.processedBody).toBe(text);
    expect(result.contentType).toBeUndefined();
  });

  it('Blobs should be passed through without Content-Type', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });

    const result = processBody(blob);
    expect(result.processedBody).toBe(blob);
    expect(result.contentType).toBeUndefined();
  });

  it('ArrayBuffers should be passed through without Content-Type', () => {
    const buffer = new ArrayBuffer(8);

    const result = processBody(buffer);
    expect(result.processedBody).toBe(buffer);
    expect(result.contentType).toBeUndefined();
  });

  it('TypedArrays should be passed through without Content-Type', () => {
    const uintArray = new Uint8Array([1, 2, 3]);

    const result = processBody(uintArray);
    expect(result.processedBody).toBe(uintArray);
    expect(result.contentType).toBeUndefined();
  });

  it('DataViews should be passed through without Content-Type', () => {
    const buffer = new ArrayBuffer(16);
    const dataView = new DataView(buffer);

    const result = processBody(dataView);
    expect(result.processedBody).toBe(dataView);
    expect(result.contentType).toBeUndefined();
  });
});
