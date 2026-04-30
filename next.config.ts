import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/system_admin/dashboard",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/system_admin/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
