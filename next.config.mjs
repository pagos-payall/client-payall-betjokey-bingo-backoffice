/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    API_HOST: process.env.API_HOST,
    API_URL: process.env.API_URL,
    FOOTBALL_API_KEY: process.env.FOOTBALL_API_KEY,
    FOOTBALL_API_URI: process.env.FOOTBALL_API_URI
  },
  experimental: {
    forceSwcTransforms: true,
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
