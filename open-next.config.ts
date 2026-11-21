import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every portal page is dynamic, so no incremental cache bucket is needed.
export default defineCloudflareConfig({});
