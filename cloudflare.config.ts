import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "9fb22841c183e06da3e33ebeec6dbe45",
  worker: defineWorker({
    name: "herisland",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-11",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      NEXT_PUBLIC_DATA_MODE: bindings.text("demo"),
      HERISLAND_HOSTED_DEMO: bindings.text("1"),
    },
  }),
});
