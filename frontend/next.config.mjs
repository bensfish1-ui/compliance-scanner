/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "api.compliance-scanner.com", "avatars.githubusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
