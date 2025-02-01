import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useEffect } from "react"
import { setTheme } from "@tauri-apps/api/app"

export function ModeToggle() {
  const { setTheme: setUiTheme, theme } = useTheme()
  useEffect(() => {
    if (theme !== "system") return
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    setUiTheme(systemTheme)
    setTheme(systemTheme)
  }, [])
  const toggleTheme = async () => {
    if (theme === "dark") {
      setUiTheme("light")
      await setTheme("light")
    } else if (theme === "light") {
      setUiTheme("dark")
      await setTheme("dark")
    }
  }
  return <Button onClick={toggleTheme} variant='ghost' size='icon'>
    {theme === "dark" ? <Icon icon="line-md:sunny-outline-to-moon-loop-transition" /> : <Icon icon="line-md:moon-to-sunny-outline-loop-transition" />}
  </Button>
}
