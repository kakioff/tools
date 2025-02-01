// import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
import { BrowserRouter, Route, Routes } from "react-router-dom";


import Settings from "./pages/settings";
import Home from "./pages/home";
import { SidebarProvider } from "./components/ui/sidebar";
import NavSideBar from "./components/navSideBar";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import TitleBar from "./components/titlebar";
import { useEffect, useMemo, useState } from "react";
import Tools from "./pages/tools";
import Chaci from "./pages/tools/chaci";
import Translate from "./pages/tools/translate";
import { listen } from "@tauri-apps/api/event";
import { openSettingsWindow } from "./utils/webview";
import checkForUpdates from "./utils/updater";
import { check } from "@tauri-apps/plugin-updater";
import { toast } from "sonner";
import Dialog from "./components/dialog";
import { Progress } from "./components/ui/progress";
import { Button } from "./components/ui/button";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

function App() {


  listen('open-settings', event => {
    console.log('Received from backend:', event.payload);
    openSettingsWindow(); // 调用你希望执行的函数
  });

  let [pathname, setPathname] = useState(window.location.pathname);
  window.addEventListener("popstate", () => {
    setPathname(window.location.pathname);
  });
  const isWebview = useMemo(() => {
    return !/webview/.test(pathname);
  }, [pathname]);

  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [progress, setProgress] = useState(0)
  const [updateError, setUpdateError] = useState<string>('')
  const [started, setStarted] = useState(false)
  const [speed, setSpeed] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  useEffect(() => {
    let window_label = WebviewWindow.getCurrent()
    if (window_label.label != "main") {
      return
    }
    check().then(async update => {
      if (!update?.available) return
      toast(`发现新版本 v${update.version}，是否立即更新？`, {
        closeButton: true,
        action: {
          label: '立即更新',
          onClick: async () => {
            setShowUpdateDialog(true)
            await checkForUpdates({
              autoInstall: false,
              start: (fileSize) => {
                setStarted(true)
                setFileSize(fileSize)
              },
              progress: (downloaded, contentLength, speed) => {
                setProgress(downloaded / contentLength * 100)
                setSpeed(speed)
              },
              finished: () => {
                setStarted(false)
              },
              error: (error) => {
                setUpdateError(error as string)
                setShowUpdateDialog(false)
              },
              cancel: () => {
                setShowUpdateDialog(false)
              }
            })
          }
        }
      })
    })
  }, [])
  return <BrowserRouter>
    <ThemeProvider>
      <SidebarProvider defaultOpen={isWebview} style={{
        // "--sidebar-width": "13rem",
        "--sidebar-width-mobile": "10rem",
      } as React.CSSProperties} onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}>
        <NavSideBar />
        {/* <SidebarTrigger /> */}
        <div className="w-full h-dvh flex flex-col">
          {isWebview && <TitleBar />}
          <div className="w-full h-full overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/chaci" element={<Chaci />} />
              <Route path="/tools/translate" element={<Translate />} />
              <Route path="*" element={<div>404</div>} />
            </Routes>
          </div>
        </div>
        <Toaster />
        <Dialog isOpen={showUpdateDialog} title='更新进度'>
          <div className='flex flex-row items-center justify-center gap-2'>
            <Progress value={progress} />
            <span className='nowrap text-sm text-muted-foreground'>{Number.isInteger(progress) ? progress : progress.toFixed(2)}%</span>
          </div>
          {updateError && <p className='text-sm text-red-500'>{updateError}</p>}
          <div className='text-sm text-muted-foreground flex flex-row items-center justify-between'>
            {started ? <span className='w-24 inline-block text-sm text-muted-foreground text-right'>{speed}</span> : <div></div>}
            <div>
              <span className='inline-block mr-1'>{fileSize}</span>
              <Button variant="ghost" disabled={started} onClick={() => setShowUpdateDialog(false)}>关闭</Button>
            </div>
          </div>
        </Dialog>
      </SidebarProvider>
    </ThemeProvider>
  </BrowserRouter>

}

export default App;
