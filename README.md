# Totem Pullman Costa

App para totem de reserva de boletos destinada a Pullman Costa Central

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run e2e tests
npm run e2e

# run all tests
npm test
```

# Migration Walkthrough: Vue 2.7 + Vite Upgrade

The project has been successfully migrated to **Vue 2.7.16** and **Vite**, making it fully compatible with modern
Node.js environments (running on Node `24.12.0`). All changes have been made locally on the new branch `totem3` (no
remote pushes were performed).

## Changes Implemented

### 🌿 Git Branch

- Created and checked out a new branch: `totem3`

### ⚙️ Configurations

- **[.node-version](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/.node-version):** Updated Node target to
  `24.12.0`.
- **[vite.config.js](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/vite.config.js) [NEW]:** Configured Vite compile
  rules for Vue 2, source aliases (`@` pointing to `/src`), and dev server settings.
- **[.postcssrc.js](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/.postcssrc.js):** Simplified configuration to only
  use autoprefixer (Vite resolves postcss imports and URLs automatically).
- **[index.html](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/index.html):** Injected the script tag to load the
  entry point module:
  ```html
  <script type="module" src="/src/main.js"></script>
  ```

### 📦 Dependencies Upgraded

- **[package.json](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/package.json):**
  - Upgraded `vue` to `^2.7.16` (last stable Vue 2 version, compatible with modern environments).
  - Upgraded `vue-router` to `^3.6.5` and `vuex` to `^3.6.2`.
  - Replaced `node-sass` and `sass-loader` with Dart `sass` (`^1.77.0`).
  - Replaced outdated Webpack dependencies with `vite` (`^5.2.11`) and `@vitejs/plugin-vue2` (`^2.3.1`).
  - Allowed Node engines `node >=18.0.0`.

### 🔑 Environment Variables

- **[.env](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/.env) [NEW]** &
  **[.env.example](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/.env.example) [NEW]:** Centralized environment
  variables:
  - `VITE_APP_USERNAME` / `VITE_APP_PASSWORD` for background login.
  - `VITE_APP_GDS_MODE` set to either `dev` or `prod` to toggle the environment.
  - `VITE_APP_GDS_PROXY_DEV` / `VITE_APP_GDS_API_KEY_DEV` for GDS Dev environment.
  - `VITE_APP_GDS_PROXY_PROD` / `VITE_APP_GDS_API_KEY_PROD` for GDS Prod environment.
- Sensitive values are kept in the local `.env` which is excluded via `.gitignore`. The committed `.env.example`
  contains only template placeholders to protect sensitive keys.
- **[vite.config.js](file:///c:/Users/Usuario/Desktop/wit-dev/Totem-v2/vite.config.js):** Dynamic configuration
  selecting GDS credentials based on `VITE_APP_GDS_MODE` and mapping them to `process.env` properties globally.
- Replaced all hardcoded GDS credentials with dynamic environment variables in all views, components, and mixins.

---

## Verification & Build Status

1. **Package Installation:** Installed successfully using `npm install --legacy-peer-deps` with Node 24.
2. **Build Test:** Executed `npm run build`. The build completed **successfully** and output all compiled assets under
   the `dist/` directory.
