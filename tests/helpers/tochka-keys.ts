import { generateKeyPairSync } from "node:crypto";
import {
  exportJWK,
  importPKCS8,
  importSPKI,
  SignJWT,
  type JWK,
  type KeyLike,
} from "jose";

let cached: {
  privateKey: KeyLike;
  publicJwks: { keys: JWK[] };
} | null = null;

async function ensureKeys() {
  if (cached) return cached;

  const { privateKey: privPem, publicKey: pubPem } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const privateKey = await importPKCS8(privPem, "RS256");
  const publicKey = await importSPKI(pubPem, "RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = "test-key-1";
  publicJwk.alg = "RS256";

  cached = { privateKey, publicJwks: { keys: [publicJwk] } };
  return cached;
}

export async function getTochkaTestPublicJwks(): Promise<{ keys: JWK[] }> {
  return (await ensureKeys()).publicJwks;
}

export async function signTochkaWebhook(payload: Record<string, unknown>): Promise<string> {
  const { privateKey } = await ensureKeys();
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
    .setIssuedAt()
    .sign(privateKey);
}
