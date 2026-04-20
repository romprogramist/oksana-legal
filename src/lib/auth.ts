import crypto from "crypto";

type Session = { exp: number };

function getSecret(): Buffer {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET missing or too short");
  }
  return Buffer.from(s, "utf8");
}

export function signSession(session: Session): string {
  const body = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string): Session | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if (typeof session.exp !== "number" || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function checkCredentials(login: string, password: string): boolean {
  const expectedLogin = process.env.ADMIN_LOGIN ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedLogin || !expectedPassword) return false;
  const l1 = Buffer.from(login);
  const l2 = Buffer.from(expectedLogin);
  const p1 = Buffer.from(password);
  const p2 = Buffer.from(expectedPassword);
  const loginOk = l1.length === l2.length && crypto.timingSafeEqual(l1, l2);
  const pwOk = p1.length === p2.length && crypto.timingSafeEqual(p1, p2);
  return loginOk && pwOk;
}

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function newSessionToken(): string {
  return signSession({ exp: Date.now() + SESSION_TTL_MS });
}
