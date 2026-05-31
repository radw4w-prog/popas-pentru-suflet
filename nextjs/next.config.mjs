/** @type {import('next').NextConfig} */
const nextConfig = {
  // ═══ Redirect-uri pentru rute vechi / broken ═══
  async redirects() {
    return [
      {
        source: '/verses',
        destination: '/biblia',
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
