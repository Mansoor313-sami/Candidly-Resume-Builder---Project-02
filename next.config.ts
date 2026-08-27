import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Firebase's redirect sign-in helper normally lives on `*.firebaseapp.com`.
  // Proxying it through the deployed app domain avoids mobile browsers blocking
  // the helper's third-party storage. See the README/Firebase setup notes.
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://candidly-resume-builder.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};
export default nextConfig;
