/**
 * Decodes the JWT `credential` string from Google Identity Services (payload only).
 * Does not verify the signature — backend may verify later.
 */
export type GoogleCredentialPayload = {
  email: string;
  name: string;
  picture?: string;
  sub: string;
};

export function decodeGoogleCredentialJwt(
  credential: string,
): GoogleCredentialPayload | null {
  try {
    const parts = credential.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    const json = atob(padded);
    const data = JSON.parse(json) as Record<string, unknown>;

    const email = typeof data.email === "string" ? data.email : undefined;
    const sub = typeof data.sub === "string" ? data.sub : undefined;
    const nameRaw = typeof data.name === "string" ? data.name : undefined;
    const picture =
      typeof data.picture === "string" ? data.picture : undefined;

    if (!email || !sub) return null;

    const name =
      nameRaw?.trim() ||
      email.split("@")[0] ||
      "User";

    return { email, name, picture, sub };
  } catch {
    return null;
  }
}
