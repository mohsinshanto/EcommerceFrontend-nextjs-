import type { NextConfig } from "next";

const allowedDevOrigins = (
  process.env.NEXT_ALLOWED_DEV_ORIGINS ||
  "http://localhost:3000,http://192.168.0.109:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
