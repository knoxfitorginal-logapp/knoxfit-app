/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent native modules and Node built-ins from bundling in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
        snappy: false,
      };

      // Also mark snappy as external for browser build
      config.externals.push({ snappy: "commonjs snappy" });
    }
    return config;
  },
};

export default nextConfig;
