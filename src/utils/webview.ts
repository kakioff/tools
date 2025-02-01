import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Window } from "@tauri-apps/api/window";

export const openSettingsWindow = async () => {
  let webview = await WebviewWindow.getByLabel("settings");
  if (!webview) {
    const mainApp = await Window.getByLabel("main");
    let mainAppPos = await mainApp?.outerPosition();
    let mainAppSize = await mainApp?.outerSize();
    let w = (mainAppSize?.width || 800) / 2,
      x = (mainAppPos?.x || 0) + w / 2,
      y = mainAppPos?.y || 0;

    webview = new WebviewWindow("settings", {
      url: "/settings",
      title: "设置",
      width: 400,
      height: mainAppSize?.height || 600,
      x,
      y,
      resizable: false,
      decorations: false,
      contentProtected: true,
      skipTaskbar: true,
      maximizable: false,
      minimizable: false,
      parent: WebviewWindow.getCurrent() || Window.getCurrent(),
    });
  }

  webview.show();
  webview.setFocus();
};
