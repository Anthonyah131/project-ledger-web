// lib/report-download.ts
// Binary report download helper.
// Fetches a blob from the API (Excel/PDF) and triggers a browser download.

import { getAccessToken, ApiClientError } from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5192/api";

/**
 * Download a binary report (Excel or PDF) by fetching as blob.
 * Extracts the filename from the Content-Disposition header when available.
 */
export async function downloadBlobReport(path: string): Promise<void> {
  const url = `${API_BASE_URL}${path}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = { message: `Request failed with status ${res.status}` };
    }
    throw new ApiClientError(res.status, data);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? "report";

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
