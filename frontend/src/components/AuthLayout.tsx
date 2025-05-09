import { Rocket } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="h-screen p-4 md:p-8">
            <main className="w-full h-full bg-background/30 rounded-2xl overflow-auto p-4">
                <div className="mx-auto w-fit">
                    {/* Heading */}
                    <h1 className="flex items-center gap-4 text-3xl font-semibold m-8">
                        <Rocket className="text-foreground" size={32} />
                        Task Matrix
                    </h1>

                    {/* Form Start */}
                    <div className="p-8 border bg-accent-foreground border-card text-card-foreground rounded-lg shadow-xl">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>

    );
}
