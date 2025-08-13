/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        snappy: "commonjs snappy",
        "node:fs": "commonjs fs",
        "node:http": "commonjs http",
        "node:https": "commonjs https",
      });
    }
    return config;
  },
};

export default nextConfig;
