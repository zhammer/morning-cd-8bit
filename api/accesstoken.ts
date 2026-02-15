import "../backend/env";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClientCredentialsToken } from "../backend/clients/spotify";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const accessToken = await getClientCredentialsToken(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!
    );
    res.setHeader("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*");
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Failed to get Spotify access token:", error);
    return res.status(500).json({ error: "Failed to get access token" });
  }
}
