import { SearchX } from "lucide-react"
import { NavLink } from "react-router-dom"

const NotFoundPage = () => {
    return (
        <>
            <div className="h-screen w-full flex flex-col
                items-center justify-center
                gap-4 m-auto"
            >
                <div className="flex flex-col md:flex-row  text-6xl font-black gap-4">
                    <SearchX size={64} />
                    <h1 className="">
                        Page Not Found
                    </h1>
                </div>
                <NavLink to={"/"} className="text-md text-blue-600 hover:underline">Back Home</NavLink>
            </div>
        </>
    )
}

export default NotFoundPage