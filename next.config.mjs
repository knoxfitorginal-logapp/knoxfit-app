/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure native/node-only deps are never attempted in the client bundle
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
