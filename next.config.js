/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  headers: [
    {
      source: "/(.*)",
      headers: [
        {
          key: "access-control-allow-origin",
          value: "*",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
