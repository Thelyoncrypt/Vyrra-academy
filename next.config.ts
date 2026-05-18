import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 + the pg driver adapter must stay external to the server bundle
  // (native `pg` + the generated client can't be Webpack/Turbopack-bundled).
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
};

export default nextConfig;
