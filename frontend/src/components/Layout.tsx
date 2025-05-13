import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { DoorOpen, Rocket } from "lucide-react"
import { Button } from "./ui/Button"
import { useAuth } from "../context/authProvider"

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen w-screen flex-col">
      <div className=" bg-background">
        <header className="w-full max-w-7xl flex items-center justify-between mx-auto p-4">
          {/* Logo */}
          <h2 className="flex items-center gap-4 text-xl font-semibold w-fit">
            <Rocket className="text-foreground" size={24} />
            Task Matrix
          </h2>

          {/* logout */}
          <Button variant="outline" className="text-red-700 border-red-700 shadow-md  " onClick={logout}>
            <DoorOpen />
          </Button>
        </header >
      </div>
      <Sidebar>
        <Outlet />
      </Sidebar>
    </div>
  )
}

export default Layout