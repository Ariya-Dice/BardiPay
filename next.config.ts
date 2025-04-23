import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'export', // برای خروجی استاتیک
  images: {
    unoptimized: true, // غیرفعال کردن بهینه‌سازی تصاویر
  },
};

export default nextConfig;