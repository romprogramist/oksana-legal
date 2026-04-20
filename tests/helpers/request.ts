import { NextRequest } from "next/server";

export function makeRequest(
  url: string,
  opts: { method?: string; body?: unknown; headers?: Record<string, string>; cookies?: Record<string, string> } = {}
): NextRequest {
  const { method = "GET", body, headers = {}, cookies = {} } = opts;
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    headers["content-type"] ??= "application/json";
  }
  init.headers = headers;
  const req = new NextRequest(new URL(url, "http://localhost").toString(), init as any);
  for (const [k, v] of Object.entries(cookies)) req.cookies.set(k, v);
  return req;
}

export async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
