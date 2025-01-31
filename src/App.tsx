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
import { useMemo, useState } from "react";
import Tools from "./pages/tools";
import Chaci from "./pages/tools/chaci";
import Translate from "./pages/tools/translate";
// import checkForUpdates from "./utils/updater";
function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }
  // load path name
  // checkForUpdates()
  let [pathname, setPathname] = useState(window.location.pathname);
  window.addEventListener("popstate", () => {
    setPathname(window.location.pathname);
  });
  const isWebview = useMemo(() => {
    return !/webview/.test(pathname);
  }, [pathname]);


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
      </SidebarProvider>
    </ThemeProvider>
  </BrowserRouter>

}

export default App;
