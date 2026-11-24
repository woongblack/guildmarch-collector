/** @type {import('next').NextConfig} */
export default {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Two root layouts ((redirect) and [lang]) need a not-found page of their own
  experimental: { globalNotFound: true },
};
