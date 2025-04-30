/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Completely disable ESLint during builds
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Completely disable TypeScript checking during builds
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
    // Ensure we're using the correct output directory
    distDir: '.next',
  }
  
  export default nextConfig
  