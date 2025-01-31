import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export default async function checkForUpdates() {
  const update = await check();
  if (update?.available) {
    await update.downloadAndInstall();
    await relaunch();
  }
}

// 在合适的地方调用 checkForUpdates 函数