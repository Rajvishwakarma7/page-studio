import { createClient } from "contentful";

type ClientMode = "delivery" | "preview";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createContentfulClient(mode: ClientMode = "delivery") {
  const accessToken =
    mode === "preview"
      ? requiredEnv("CONTENTFUL_PREVIEW_TOKEN")
      : requiredEnv("CONTENTFUL_DELIVERY_TOKEN");

  return createClient({
    space: requiredEnv("CONTENTFUL_SPACE_ID"),
    environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
    accessToken,
    host: mode === "preview" ? "preview.contentful.com" : "cdn.contentful.com",
  });
}
