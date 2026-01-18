// vite.config.ts
import { defineConfig } from "file:///E:/OneDrive/%E6%A1%8C%E9%9D%A2/automatic/lora-dataset-builder/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/OneDrive/%E6%A1%8C%E9%9D%A2/automatic/lora-dataset-builder/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import fs from "node:fs";
import path from "node:path";
var __vite_injected_original_dirname = "E:\\OneDrive\\\u684C\u9762\\automatic\\lora-dataset-builder\\frontend";
var portsPath = path.resolve(__vite_injected_original_dirname, "../config/ports.json");
if (!fs.existsSync(portsPath)) {
  throw new Error("Missing config/ports.json");
}
var ports = JSON.parse(fs.readFileSync(portsPath, "utf-8"));
var frontendPort = Number(ports.frontend_port || 8080);
var backendPort = Number(ports.backend_port || 8081);
var argPortIndex = process.argv.findIndex((arg) => arg === "--port");
if (argPortIndex !== -1) {
  const cliPort = Number(process.argv[argPortIndex + 1]);
  if (cliPort && cliPort !== frontendPort) {
    throw new Error(`Frontend port must be ${frontendPort} (config/ports.json)`);
  }
}
var vite_config_default = defineConfig({
  plugins: [vue()],
  server: {
    port: frontendPort,
    host: ports.frontend_host || "0.0.0.0",
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true
      },
      "/static": {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: frontendPort,
    host: ports.frontend_host || "0.0.0.0"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxPbmVEcml2ZVxcXFxcdTY4NENcdTk3NjJcXFxcYXV0b21hdGljXFxcXGxvcmEtZGF0YXNldC1idWlsZGVyXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxPbmVEcml2ZVxcXFxcdTY4NENcdTk3NjJcXFxcYXV0b21hdGljXFxcXGxvcmEtZGF0YXNldC1idWlsZGVyXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9PbmVEcml2ZS8lRTYlQTElOEMlRTklOUQlQTIvYXV0b21hdGljL2xvcmEtZGF0YXNldC1idWlsZGVyL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5jb25zdCBwb3J0c1BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vY29uZmlnL3BvcnRzLmpzb24nKVxuaWYgKCFmcy5leGlzdHNTeW5jKHBvcnRzUGF0aCkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNvbmZpZy9wb3J0cy5qc29uJylcbn1cbmNvbnN0IHBvcnRzID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocG9ydHNQYXRoLCAndXRmLTgnKSlcbmNvbnN0IGZyb250ZW5kUG9ydCA9IE51bWJlcihwb3J0cy5mcm9udGVuZF9wb3J0IHx8IDgwODApXG5jb25zdCBiYWNrZW5kUG9ydCA9IE51bWJlcihwb3J0cy5iYWNrZW5kX3BvcnQgfHwgODA4MSlcblxuY29uc3QgYXJnUG9ydEluZGV4ID0gcHJvY2Vzcy5hcmd2LmZpbmRJbmRleCgoYXJnKSA9PiBhcmcgPT09ICctLXBvcnQnKVxuaWYgKGFyZ1BvcnRJbmRleCAhPT0gLTEpIHtcbiAgY29uc3QgY2xpUG9ydCA9IE51bWJlcihwcm9jZXNzLmFyZ3ZbYXJnUG9ydEluZGV4ICsgMV0pXG4gIGlmIChjbGlQb3J0ICYmIGNsaVBvcnQgIT09IGZyb250ZW5kUG9ydCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRnJvbnRlbmQgcG9ydCBtdXN0IGJlICR7ZnJvbnRlbmRQb3J0fSAoY29uZmlnL3BvcnRzLmpzb24pYClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbdnVlKCldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiBmcm9udGVuZFBvcnQsXG4gICAgaG9zdDogcG9ydHMuZnJvbnRlbmRfaG9zdCB8fCAnMC4wLjAuMCcsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly8xMjcuMC4wLjE6JHtiYWNrZW5kUG9ydH1gLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH0sXG4gICAgICAnL3N0YXRpYyc6IHtcbiAgICAgICAgdGFyZ2V0OiBgaHR0cDovLzEyNy4wLjAuMToke2JhY2tlbmRQb3J0fWAsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IGZyb250ZW5kUG9ydCxcbiAgICBob3N0OiBwb3J0cy5mcm9udGVuZF9ob3N0IHx8ICcwLjAuMC4wJ1xuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnWCxTQUFTLG9CQUFvQjtBQUM3WSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sWUFBWSxLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQ2hFLElBQUksQ0FBQyxHQUFHLFdBQVcsU0FBUyxHQUFHO0FBQzdCLFFBQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUM3QztBQUNBLElBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRyxhQUFhLFdBQVcsT0FBTyxDQUFDO0FBQzVELElBQU0sZUFBZSxPQUFPLE1BQU0saUJBQWlCLElBQUk7QUFDdkQsSUFBTSxjQUFjLE9BQU8sTUFBTSxnQkFBZ0IsSUFBSTtBQUVyRCxJQUFNLGVBQWUsUUFBUSxLQUFLLFVBQVUsQ0FBQyxRQUFRLFFBQVEsUUFBUTtBQUNyRSxJQUFJLGlCQUFpQixJQUFJO0FBQ3ZCLFFBQU0sVUFBVSxPQUFPLFFBQVEsS0FBSyxlQUFlLENBQUMsQ0FBQztBQUNyRCxNQUFJLFdBQVcsWUFBWSxjQUFjO0FBQ3ZDLFVBQU0sSUFBSSxNQUFNLHlCQUF5QixZQUFZLHNCQUFzQjtBQUFBLEVBQzdFO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDZixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNLE1BQU0saUJBQWlCO0FBQUEsSUFDN0IsWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUSxvQkFBb0IsV0FBVztBQUFBLFFBQ3ZDLGNBQWM7QUFBQSxNQUNoQjtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsUUFBUSxvQkFBb0IsV0FBVztBQUFBLFFBQ3ZDLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNLE1BQU0saUJBQWlCO0FBQUEsRUFDL0I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
