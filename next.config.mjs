const repo = "Ptakim";

const nextConfig = {
  output: "export",

  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,

  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "track-pebbly-engaged.ngrok-free.dev"
  ]
};

export default nextConfig;