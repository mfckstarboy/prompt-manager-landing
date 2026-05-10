export type PublicPaddleEnv = "sandbox" | "production";

export function getPublicPaddleEnv(value = process.env.NEXT_PUBLIC_PADDLE_ENV): PublicPaddleEnv {
  return value === "production" ? "production" : "sandbox";
}

export function shouldSetPaddleSandbox(value = process.env.NEXT_PUBLIC_PADDLE_ENV) {
  return getPublicPaddleEnv(value) === "sandbox";
}
