import { Icon } from "@iconify/react/dist/iconify.js";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenuButton } from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Window } from "@tauri-apps/api/window";


export default function navSideBar() {
  const location = useLocation(); // 获取当前路由
  const currentPath = location.pathname;


  const openSettingsWindow = async () => {
    const mainApp = await Window.getByLabel("main");
    let mainAppPos = await mainApp?.outerPosition();
    let mainAppSize = await mainApp?.outerSize();
    let w = (mainAppSize?.width || 800) / 2,
      x = (mainAppPos?.x || 0) + w / 2,
      y = (mainAppPos?.y || 0);

    let webview = new WebviewWindow("settings", {
      url: "/settings",
      title: "设置",
      width: 400,
      height: mainAppSize?.height || 600,
      x, y,
      resizable: false,
      decorations: false,
      contentProtected: true,
      skipTaskbar: true,
      maximizable: false,
      minimizable: false,
      parent: WebviewWindow.getCurrent() || Window.getCurrent(),
    })
    webview.show()
  }

  let menu: {
    label: string,
    icon: string,
    path: string,
    link?: boolean
  }[][] = [[{
    label: "主页",
    icon: "tabler:home",
    path: "/"
  }, {
    label: "查违禁词",
    icon: "tabler:search",
    path: "/tools/chaci"
  }, {
    label: "翻译",
    icon: "tabler:language",
    path: "/tools/translate"
  }], [{
    label: "ChatGPT",
    icon: "tabler:brand-openai",
    path: "https://chatgpt.com",
    link: true
  }]]
  return <Sidebar >
    <SidebarHeader>
      <h2 data-tauri-drag-region className="select-none">工具箱</h2>
    </SidebarHeader>
    <SidebarContent data-tauri-drag-region>
      {menu.map((itemGroup, gi) => <div key={gi}>
        <SidebarGroup>
          {itemGroup.map(item => <SidebarMenuButton key={item.path} asChild isActive={currentPath === item.path}>
            <Link to={item.path} target={item.link ? "_blank" : "_self"}>
              <Icon icon={item.icon} />
              {item.label}
              {item.link && <Icon icon="heroicons:arrow-top-right-on-square-16-solid" />}
            </Link>
          </SidebarMenuButton>)}
        </SidebarGroup>
      </div>)}
    </SidebarContent>
    <SidebarFooter>
      <div className="flex flex-row justify-between items-center select-none" >
        <span data-tauri-drag-region>© 2025 Byron</span>
        <div>
          <ModeToggle />
          {/* <Link to="/settings"> */}
          <Button variant={currentPath === "/settings" ? "secondary" : "ghost"}
            onClick={openSettingsWindow}
            size='icon'>
            <Icon icon={"tabler:settings"} />
          </Button>
          {/* </Link> */}
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>;
}