// vite.config.js
import { defineConfig, loadEnv } from "file:///E:/.project/QuantDinger/QuantDinger-Vue/node_modules/.pnpm/vite@5.4.21_@types+node@25.8.0_less@3.13.1/node_modules/vite/dist/node/index.js";
import vue2 from "file:///E:/.project/QuantDinger/QuantDinger-Vue/node_modules/.pnpm/@vitejs+plugin-vue2@2.3.4_v_aadabd2afe2ea7d09e1116c1be7428ad/node_modules/@vitejs/plugin-vue2/dist/index.mjs";
import vue2Jsx from "file:///E:/.project/QuantDinger/QuantDinger-Vue/node_modules/.pnpm/@vitejs+plugin-vue2-jsx@1.1_44336238b2c397e7f9b6ff958821757d/node_modules/@vitejs/plugin-vue2-jsx/dist/index.mjs";
import svgLoader from "file:///E:/.project/QuantDinger/QuantDinger-Vue/node_modules/.pnpm/vite-svg-loader@4.0.0/node_modules/vite-svg-loader/index.js";
import { viteMockServe } from "file:///E:/.project/QuantDinger/QuantDinger-Vue/node_modules/.pnpm/vite-plugin-mock@3.0.2_esbu_6dc0bb94eb562e1d60828fbacb1a4d6f/node_modules/vite-plugin-mock/dist/index.mjs";
import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
var __vite_injected_original_import_meta_url = "file:///E:/.project/QuantDinger/QuantDinger-Vue/vite.config.js";
var pkg = JSON.parse(readFileSync(new URL("./package.json", __vite_injected_original_import_meta_url), "utf-8"));
var gitHash = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {
    return "unknown";
  }
})();
var buildDate = (/* @__PURE__ */ new Date()).toLocaleString();
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const enableMock = env.VITE_ENABLE_MOCK === "true";
  return {
    base: "./",
    resolve: {
      alias: [
        // webpack 风格的 ~package/... less @import → 直接命中 node_modules
        { find: /^~(.+)/, replacement: "$1" },
        // pro-layout 1.x 仍引用 webpack 专用插件 client，用 shim 兼容
        { find: "webpack-theme-color-replacer/client", replacement: fileURLToPath(new URL("./src/shims/webpack-theme-color-replacer-client.js", __vite_injected_original_import_meta_url)) },
        // moment 纯 CJS（module.exports = ctor），Vite 下 `import * as moment from 'moment'`
        // namespace 拿不到 isMoment 等静态方法 → 走 shim 平铺 named exports
        { find: /^moment$/, replacement: fileURLToPath(new URL("./src/shims/moment.js", __vite_injected_original_import_meta_url)) },
        { find: /^store$/, replacement: "store/dist/store.modern.js" },
        { find: "@", replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)) },
        { find: "@$", replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)) }
      ],
      // 兼容旧代码中省略 .vue 后缀的 import（如 `import App from './App'`）
      extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    define: {
      APP_VERSION: JSON.stringify(pkg.version),
      GIT_HASH: JSON.stringify(gitHash),
      BUILD_DATE: JSON.stringify(buildDate),
      // 兼容旧代码中的 process.env.VUE_APP_* 引用 —— 直接映射到 import.meta.env.VITE_*
      "process.env.VUE_APP_PREVIEW": JSON.stringify(env.VITE_PREVIEW || ""),
      "process.env.VUE_APP_API_BASE_URL": JSON.stringify(env.VITE_API_BASE_URL || ""),
      "process.env.VUE_APP_PYTHON_API_BASE_URL": JSON.stringify(env.VITE_PYTHON_API_BASE_URL || ""),
      "process.env.VUE_APP_PYODIDE_CDN_BASE": JSON.stringify(env.VITE_PYODIDE_CDN_BASE || ""),
      "process.env.VUE_APP_PYODIDE_LOCAL_BASE": JSON.stringify(env.VITE_PYODIDE_LOCAL_BASE || ""),
      "process.env.VUE_APP_PYODIDE_PREFER_CDN": JSON.stringify(env.VITE_PYODIDE_PREFER_CDN || "")
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            "border-radius-base": "2px"
          }
        }
      }
    },
    plugins: [
      vue2(),
      vue2Jsx(),
      svgLoader({ defaultImport: "url" }),
      viteMockServe({
        mockPath: "src/mock/services",
        enable: enableMock,
        watchFiles: true,
        logger: true
      })
    ],
    server: {
      port: 8e3,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
          ws: true,
          changeOrigin: true,
          timeout: 6e5,
          proxyTimeout: 6e5
        }
      }
    },
    worker: {
      format: "es"
    },
    optimizeDeps: {
      // pyodide 自己通过 Worker 内 importScripts 加载，不参与 Vite 预构建
      exclude: ["pyodide"]
    },
    build: {
      target: "es2020",
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      commonjsOptions: {
        transformMixedEsModules: true
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "ant-design-vue": ["ant-design-vue"],
            echarts: ["echarts"],
            klinecharts: ["klinecharts"],
            codemirror: ["codemirror"]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFwucHJvamVjdFxcXFxRdWFudERpbmdlclxcXFxRdWFudERpbmdlci1WdWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXC5wcm9qZWN0XFxcXFF1YW50RGluZ2VyXFxcXFF1YW50RGluZ2VyLVZ1ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovLnByb2plY3QvUXVhbnREaW5nZXIvUXVhbnREaW5nZXItVnVlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUyIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZTInXG5pbXBvcnQgdnVlMkpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUyLWpzeCdcbmltcG9ydCBzdmdMb2FkZXIgZnJvbSAndml0ZS1zdmctbG9hZGVyJ1xuaW1wb3J0IHsgdml0ZU1vY2tTZXJ2ZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcydcblxuY29uc3QgcGtnID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMobmV3IFVSTCgnLi9wYWNrYWdlLmpzb24nLCBpbXBvcnQubWV0YS51cmwpLCAndXRmLTgnKSlcblxuY29uc3QgZ2l0SGFzaCA9ICgoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGV4ZWNTeW5jKCdnaXQgcmV2LXBhcnNlIC0tc2hvcnQgSEVBRCcpLnRvU3RyaW5nKCkudHJpbSgpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gJ3Vua25vd24nXG4gIH1cbn0pKClcblxuY29uc3QgYnVpbGREYXRlID0gbmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgY29uc3QgZW5hYmxlTW9jayA9IGVudi5WSVRFX0VOQUJMRV9NT0NLID09PSAndHJ1ZSdcblxuICByZXR1cm4ge1xuICAgIGJhc2U6ICcuLycsXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IFtcbiAgICAgICAgLy8gd2VicGFjayBcdTk4Q0VcdTY4M0NcdTc2ODQgfnBhY2thZ2UvLi4uIGxlc3MgQGltcG9ydCBcdTIxOTIgXHU3NkY0XHU2M0E1XHU1NDdEXHU0RTJEIG5vZGVfbW9kdWxlc1xuICAgICAgICB7IGZpbmQ6IC9efiguKykvLCByZXBsYWNlbWVudDogJyQxJyB9LFxuICAgICAgICAvLyBwcm8tbGF5b3V0IDEueCBcdTRFQ0RcdTVGMTVcdTc1Mjggd2VicGFjayBcdTRFMTNcdTc1MjhcdTYzRDJcdTRFRjYgY2xpZW50XHVGRjBDXHU3NTI4IHNoaW0gXHU1MTdDXHU1QkI5XG4gICAgICAgIHsgZmluZDogJ3dlYnBhY2stdGhlbWUtY29sb3ItcmVwbGFjZXIvY2xpZW50JywgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvc2hpbXMvd2VicGFjay10aGVtZS1jb2xvci1yZXBsYWNlci1jbGllbnQuanMnLCBpbXBvcnQubWV0YS51cmwpKSB9LFxuICAgICAgICAvLyBtb21lbnQgXHU3RUFGIENKU1x1RkYwOG1vZHVsZS5leHBvcnRzID0gY3Rvclx1RkYwOVx1RkYwQ1ZpdGUgXHU0RTBCIGBpbXBvcnQgKiBhcyBtb21lbnQgZnJvbSAnbW9tZW50J2BcbiAgICAgICAgLy8gbmFtZXNwYWNlIFx1NjJGRlx1NEUwRFx1NTIzMCBpc01vbWVudCBcdTdCNDlcdTk3NTlcdTYwMDFcdTY1QjlcdTZDRDUgXHUyMTkyIFx1OEQ3MCBzaGltIFx1NUU3M1x1OTRGQSBuYW1lZCBleHBvcnRzXG4gICAgICAgIHsgZmluZDogL15tb21lbnQkLywgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvc2hpbXMvbW9tZW50LmpzJywgaW1wb3J0Lm1ldGEudXJsKSkgfSxcbiAgICAgICAgeyBmaW5kOiAvXnN0b3JlJC8sIHJlcGxhY2VtZW50OiAnc3RvcmUvZGlzdC9zdG9yZS5tb2Rlcm4uanMnIH0sXG4gICAgICAgIHsgZmluZDogJ0AnLCByZXBsYWNlbWVudDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpIH0sXG4gICAgICAgIHsgZmluZDogJ0AkJywgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSB9XG4gICAgICBdLFxuICAgICAgLy8gXHU1MTdDXHU1QkI5XHU2NUU3XHU0RUUzXHU3ODAxXHU0RTJEXHU3NzAxXHU3NTY1IC52dWUgXHU1NDBFXHU3RjAwXHU3Njg0IGltcG9ydFx1RkYwOFx1NTk4MiBgaW1wb3J0IEFwcCBmcm9tICcuL0FwcCdgXHVGRjA5XG4gICAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy5tdHMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ11cbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgQVBQX1ZFUlNJT046IEpTT04uc3RyaW5naWZ5KHBrZy52ZXJzaW9uKSxcbiAgICAgIEdJVF9IQVNIOiBKU09OLnN0cmluZ2lmeShnaXRIYXNoKSxcbiAgICAgIEJVSUxEX0RBVEU6IEpTT04uc3RyaW5naWZ5KGJ1aWxkRGF0ZSksXG4gICAgICAvLyBcdTUxN0NcdTVCQjlcdTY1RTdcdTRFRTNcdTc4MDFcdTRFMkRcdTc2ODQgcHJvY2Vzcy5lbnYuVlVFX0FQUF8qIFx1NUYxNVx1NzUyOCBcdTIwMTRcdTIwMTQgXHU3NkY0XHU2M0E1XHU2NjIwXHU1QzA0XHU1MjMwIGltcG9ydC5tZXRhLmVudi5WSVRFXypcbiAgICAgICdwcm9jZXNzLmVudi5WVUVfQVBQX1BSRVZJRVcnOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9QUkVWSUVXIHx8ICcnKSxcbiAgICAgICdwcm9jZXNzLmVudi5WVUVfQVBQX0FQSV9CQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0FQSV9CQVNFX1VSTCB8fCAnJyksXG4gICAgICAncHJvY2Vzcy5lbnYuVlVFX0FQUF9QWVRIT05fQVBJX0JBU0VfVVJMJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfUFlUSE9OX0FQSV9CQVNFX1VSTCB8fCAnJyksXG4gICAgICAncHJvY2Vzcy5lbnYuVlVFX0FQUF9QWU9ESURFX0NETl9CQVNFJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfUFlPRElERV9DRE5fQkFTRSB8fCAnJyksXG4gICAgICAncHJvY2Vzcy5lbnYuVlVFX0FQUF9QWU9ESURFX0xPQ0FMX0JBU0UnOiBKU09OLnN0cmluZ2lmeShlbnYuVklURV9QWU9ESURFX0xPQ0FMX0JBU0UgfHwgJycpLFxuICAgICAgJ3Byb2Nlc3MuZW52LlZVRV9BUFBfUFlPRElERV9QUkVGRVJfQ0ROJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfUFlPRElERV9QUkVGRVJfQ0ROIHx8ICcnKVxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBtb2RpZnlWYXJzOiB7XG4gICAgICAgICAgICAnYm9yZGVyLXJhZGl1cy1iYXNlJzogJzJweCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZTIoKSxcbiAgICAgIHZ1ZTJKc3goKSxcbiAgICAgIHN2Z0xvYWRlcih7IGRlZmF1bHRJbXBvcnQ6ICd1cmwnIH0pLFxuICAgICAgdml0ZU1vY2tTZXJ2ZSh7XG4gICAgICAgIG1vY2tQYXRoOiAnc3JjL21vY2svc2VydmljZXMnLFxuICAgICAgICBlbmFibGU6IGVuYWJsZU1vY2ssXG4gICAgICAgIHdhdGNoRmlsZXM6IHRydWUsXG4gICAgICAgIGxvZ2dlcjogdHJ1ZVxuICAgICAgfSlcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogODAwMCxcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGVudi5WSVRFX0RFVl9QUk9YWV9UQVJHRVQgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXG4gICAgICAgICAgd3M6IHRydWUsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHRpbWVvdXQ6IDYwMDAwMCxcbiAgICAgICAgICBwcm94eVRpbWVvdXQ6IDYwMDAwMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB3b3JrZXI6IHtcbiAgICAgIGZvcm1hdDogJ2VzJ1xuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAvLyBweW9kaWRlIFx1ODFFQVx1NURGMVx1OTAxQVx1OEZDNyBXb3JrZXIgXHU1MTg1IGltcG9ydFNjcmlwdHMgXHU1MkEwXHU4RjdEXHVGRjBDXHU0RTBEXHU1M0MyXHU0RTBFIFZpdGUgXHU5ODg0XHU2Nzg0XHU1RUZBXG4gICAgICBleGNsdWRlOiBbJ3B5b2RpZGUnXVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxNTAwLFxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlXG4gICAgICB9LFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdhbnQtZGVzaWduLXZ1ZSc6IFsnYW50LWRlc2lnbi12dWUnXSxcbiAgICAgICAgICAgIGVjaGFydHM6IFsnZWNoYXJ0cyddLFxuICAgICAgICAgICAga2xpbmVjaGFydHM6IFsna2xpbmVjaGFydHMnXSxcbiAgICAgICAgICAgIGNvZGVtaXJyb3I6IFsnY29kZW1pcnJvciddXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUyxTQUFTLGNBQWMsZUFBZTtBQUNyVixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sZUFBZTtBQUN0QixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGVBQWUsV0FBVztBQUNuQyxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLG9CQUFvQjtBQVBnSyxJQUFNLDJDQUEyQztBQVM5TyxJQUFNLE1BQU0sS0FBSyxNQUFNLGFBQWEsSUFBSSxJQUFJLGtCQUFrQix3Q0FBZSxHQUFHLE9BQU8sQ0FBQztBQUV4RixJQUFNLFdBQVcsTUFBTTtBQUNyQixNQUFJO0FBQ0YsV0FBTyxTQUFTLDRCQUE0QixFQUFFLFNBQVMsRUFBRSxLQUFLO0FBQUEsRUFDaEUsU0FBUyxHQUFHO0FBQ1YsV0FBTztBQUFBLEVBQ1Q7QUFDRixHQUFHO0FBRUgsSUFBTSxhQUFZLG9CQUFJLEtBQUssR0FBRSxlQUFlO0FBRTVDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLGFBQWEsSUFBSSxxQkFBcUI7QUFFNUMs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
