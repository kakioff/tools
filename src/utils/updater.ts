import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { confirm } from "@tauri-apps/plugin-dialog";

interface Props {
  autoInstall?: boolean;
  start?(fileSize: string): void;
  progress?(downloaded: number, contentLength: number, speed: string): void;
  finished?(): void;
  error?(err: unknown): void;
  cancel?(): void;
}
/**
 * 检查更新并安装
 * @param props 
 * @returns 
 */
export default async function checkForUpdates({
  autoInstall = false,
  progress, start, finished, error, cancel
}: Props) {
  const update = await check();
  if (!update?.available) {
    return false;
  }
  let contentLength = 0,
    downloaded = 0;
  try {
    await update.download((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength as number;
          const size = contentLength > 1024 * 1024
            ? `${(contentLength / (1024 * 1024)).toFixed(2)} MB`
            : `${(contentLength / 1024).toFixed(2)} KB`;
          start && start(size);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          // 计算下载速度 (bytes/s)
          const speed = event.data.chunkLength;
          // 转换为更友好的单位显示 (MB/s 或 KB/s)
          const speedText = speed > 1024 * 1024
            ? `${(speed / (1024 * 1024)).toFixed(2)} MB/s`
            : `${(speed / 1024).toFixed(2)} KB/s`;
          progress && progress(downloaded, contentLength, speedText);
          break;
        case "Finished":
          finished && finished()
          break;
      }
    });
  } catch (err) {
    console.log("download failed", err);
    error && error(err)
    return true;
  }
  if (!autoInstall) {
    const installNow = await confirm('下载完成，是否安装更新？', {
      cancelLabel: '取消',
      okLabel: '安装',
      title: '更新提示',
      kind: 'info'
    })
    if (!installNow) {
      cancel && cancel()
      return false
    }
  }
  await update.install()
  const restartNow = await confirm('更新完成，是否重启应用？', {
    cancelLabel: '取消',
    okLabel: '重启',
    title: '更新提示',
    kind: 'info'
  })
  if (restartNow) await relaunch()
  return true;
}

// 在合适的地方调用 checkForUpdates 函数
