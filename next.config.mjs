/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedForwardedHosts: ["*"],
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
