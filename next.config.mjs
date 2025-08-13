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
      // Prevent 'snappy' native module from being bundled for the browser
      config.externals.push({ snappy: "commonjs snappy" });
    }
    return config;
  },
};

export default nextConfig;
