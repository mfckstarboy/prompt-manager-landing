import crypto from "crypto";

export function createDodoCheckoutUrl(params: {
  userId: string;
  productId: string;
  redirectUrl: string;
}): string {
  const url = new URL("https://checkout.dodopayments.com/buy/" + params.productId);
  url.searchParams.set("metadata[userId]", params.userId);
  url.searchParams.set("metadata[plan]", "premium");
  url.searchParams.set("redirect_url", params.redirectUrl);
  return url.toString();
}

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
