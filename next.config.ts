import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor'
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor'
      }
    }
  }
};

export default nextConfig;
