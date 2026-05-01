import crypto from "crypto";

export function verifyDodoWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(params.rawBody, "utf8")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(params.signature, "hex"));
}
