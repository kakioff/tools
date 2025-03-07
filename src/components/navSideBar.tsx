import { Icon } from "@iconify/react/dist/iconify.js";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenuButton, SidebarTrigger } from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { openSettingsWindow } from "@/utils/webview";
import { getVersion } from "@tauri-apps/api/app";
import { useState } from "react";


export default function navSideBar() {
  const [version, setVersion] = useState<string>("")

  getVersion().then(setVersion)

  const location = useLocation(); // 获取当前路由
  const currentPath = location.pathname;

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
    label: "Hosts",
    icon: "tabler:network",
    path: "/tools/hosts"

  }, {
    label: "翻译",
    icon: "tabler:language",
    path: "/tools/translate"

  }], [{
    label: "查违禁词",
    icon: "tabler:search",
    path: "/tools/chaci"
  }, {
    label: "ChatGPT",
    icon: "tabler:brand-openai",
    path: "https://chatgpt.com",
    link: true
  }]]
  return <Sidebar>
    <SidebarHeader>
      <h2 data-tauri-drag-region className="select-none flex flex-row items-center gap-2">
        <SidebarTrigger />
        工具箱
      </h2>
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
      <div className="flex flex-row justify-between items-center select-none w-full text-xs" >
        <span data-tauri-drag-region>@Byron - v{version}</span>
        <div>
          <ModeToggle />
          <Button variant={currentPath === "/settings" ? "secondary" : "ghost"}
            onClick={openSettingsWindow}
            size='icon'>
            <Icon icon={"tabler:settings"} />
          </Button>
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>;
}