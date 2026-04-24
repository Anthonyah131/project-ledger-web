import { vi, type MockInstance } from "vitest";
import type {
  ApiRequestOptions,
} from "@/lib/api-client";

export interface MockApiSuccessResponse<T = unknown> {
  ok: true;
  status: number;
  data: T;
  headers?: Record<string, string>;
}

export interface MockApiErrorResponse {
  ok: false;
  status: number;
  data: unknown;
  errorMessage?: string;
}

export type MockApiResponse<T = unknown> =
  | MockApiSuccessResponse<T>
  | MockApiErrorResponse;

function buildHeaders(headers: Record<string, string> = {}) {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    h.set(key, value);
  }
  h.set("content-type", "application/json");
  return h;
}

export function createSuccessResponse<T>(data: T, status = 200): MockApiSuccessResponse<T> {
  return { ok: true, status, data, headers: { "content-type": "application/json" } };
}

export function createErrorResponse(
  status: number,
  data: unknown,
  errorMessage?: string,
): MockApiErrorResponse {
  return { ok: false, status, data, errorMessage };
}

export function mockResponse<T>(response: MockApiResponse<T>) {
  return {
    ok: response.ok,
    status: response.status,
    headers: buildHeaders(response.ok ? (response.headers ?? {}) : {}),
    json: vi.fn().mockResolvedValue(response.data),
    text: vi.fn().mockResolvedValue(JSON.stringify(response.data)),
  };
}

export function createFetchMock() {
  const mock = vi.fn();
  vi.stubGlobal("fetch", mock);
  return mock;
}

export function setupFetchMock(
  mock: MockInstance<typeof fetch>,
  responses: MockApiResponse[],
) {
  mock.mockImplementation(async () => {
    const response = responses.shift();
    if (!response) {
      throw new Error("No more responses set for fetch mock");
    }
    return mockResponse(response) as unknown as Response;
  });
}

export function setupApiClient() {
  const mock = createFetchMock();

  vi.spyOn(Storage.prototype, "getItem");
  vi.spyOn(Storage.prototype, "setItem");
  vi.spyOn(Storage.prototype, "removeItem");

  return mock;
}

export function getLastFetchCall(mock: MockInstance<typeof fetch>) {
  const calls = mock.mock.calls;
  return calls[calls.length - 1] as [RequestInfo, RequestInit?];
}

export function getLastFetchUrl(mock: MockInstance<typeof fetch>) {
  const [input] = getLastFetchCall(mock);
  return typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
}

export function getLastFetchMethod(mock: MockInstance<typeof fetch>) {
  const [, init] = getLastFetchCall(mock);
  return init?.method ?? "GET";
}

export function getLastFetchBody(mock: MockInstance<typeof fetch>): string | undefined {
  const [, init] = getLastFetchCall(mock);
  return init?.body as string | undefined;
}

export function getLastFetchHeaders(mock: MockInstance<typeof fetch>): Record<string, string> {
  const [, init] = getLastFetchCall(mock);
  const headers: Record<string, string> = {};
  if (init?.headers) {
    const h = init.headers as Headers | Record<string, string>;
    if (h instanceof Headers) {
      h.forEach((v, k) => { headers[k] = v; });
    } else {
      Object.assign(headers, h);
    }
  }
  return headers;
}
