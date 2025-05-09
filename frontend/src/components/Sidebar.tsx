import { Home, LayoutTemplate, Menu, Rocket, Settings, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navs = [
    {
        to: '/',
        name: "Dashboard",
        icon: Home,
    },
    {
        to: '/projects',
        name: "Projects",
        icon: LayoutTemplate,
    },
    {
        to: '/profile',
        name: "Profile",
        icon: User,
    },
    {
        to: '/setting',
        name: "Setting",
        icon: Settings,
    },
]

const Sidebar = ({ children }: { children: ReactNode }) => {
    // TODO: Make this responsive; Drawer for smaller screen

    return (
        <div className="h-screen w-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r border-secondary">
                <h2 className="flex items-center gap-4 text-xl font-semibold my-4 mx-auto w-fit">
                    <Rocket className="text-foreground" size={24} />
                    Task Matrix
                </h2>

                {
                    navs && (
                        navs.map(e => (
                            <NavLink to={e.to} key={e.name} className="flex mx-4 my-2 gap-2 items-center hover:bg-primary/10 px-2 py-1 rounded-md">
                                <e.icon size={18} />
                                {e.name}
                            </NavLink>
                        ))
                    )
                }
            </aside>

            {/* Children in inset */}
            <main className="p-4 md:p-8 bg-background/30 w-full overflow-auto rounded-2xl">
                {children}
            </main>
        </div>
    );
};

export default Sidebar;
