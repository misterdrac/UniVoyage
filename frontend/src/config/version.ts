/** Application semver from `frontend/package.json` (injected at build time). */
declare const __APP_VERSION__: string;

export const APP_VERSION = __APP_VERSION__;

export const APP_VERSION_LABEL = `v${APP_VERSION}`;
