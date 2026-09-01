/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/product/electro-ethanol-chiller-system",
        destination: "/ethanol-chiller-blast-60",
        permanent: true
      },
      {
        source: "/wp-content/uploads/2020/02/Chiller-Cut-Sheet-ACP-30.pdf",
        destination: "/ethanol-chiller-blast-60",
        permanent: true
      },
      {
        source: "/contact",
        destination: "/contact-us",
        permanent: true
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true
      },
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
