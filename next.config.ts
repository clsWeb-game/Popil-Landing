import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2tag815a0tax5.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
