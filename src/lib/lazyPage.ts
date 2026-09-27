import type { ComponentType } from "react";

const RELOAD_FLAG = "uptrail:chunk-reload";

export function isChunkLoadError(error: unknown) {
  return (
    error instanceof Error &&
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      error.message,
    )
  );
}

export async function importWithReload<Module>(load: () => Promise<Module>) {
  try {
    const module = await load();
    sessionStorage.removeItem(RELOAD_FLAG);
    return module;
  } catch (error) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
      return new Promise<never>(() => {});
    }
    throw error;
  }
}

export function lazyPage<Module, Name extends keyof Module>(load: () => Promise<Module>, exportName: Name) {
  return async () => {
    const module = await importWithReload(load);
    return { Component: module[exportName] as ComponentType };
  };
}
