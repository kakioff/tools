import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Icon } from "@iconify/react/dist/iconify.js"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    }
  }
  return <Button onClick={toggleTheme} variant='ghost' size='icon'>
    {theme === "dark" ? <Icon icon="line-md:sunny-outline-to-moon-loop-transition" /> : <Icon icon="line-md:moon-to-sunny-outline-loop-transition" />}
  </Button>
}
