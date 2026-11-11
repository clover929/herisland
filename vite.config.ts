import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Cloudflare Demo builds must never load local operator credentials.
  envDir: false,
  define: {
    "process.env.NEXT_PUBLIC_DATA_MODE": JSON.stringify("demo"),
    "process.env.HERISLAND_HOSTED_DEMO": JSON.stringify("1"),
    "process.env.HERISLAND_REFERENCE_YEAR": JSON.stringify(String(new Date().getUTCFullYear())),
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
