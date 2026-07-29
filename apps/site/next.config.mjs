import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_OUTPUT === 'standalone' ? 'standalone' : undefined,
  outputFileTracingRoot: rootDir,
  experimental: {},
};
export default nextConfig;
