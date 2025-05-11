import { KeyRound, LogIn, User } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "../ui/Button";
import { NavLink, useNavigate } from "react-router-dom";
import type { User as UserDetail } from "../../types";
import { useAuth } from "../../context/authProvider";

type FormFields = {
    username: string;
    password: string;
}

const Login = () => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormFields>();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const newUser: UserDetail = { id: 20, name: "Test User" }
            login(newUser, "token")
            navigate("/")
        } catch (error) {
            setError("root", {
                message: "Invalid credentials",
            })
        }
        console.log(data)
    }

    const classnames = `flex h-10 w-full rounded-md border border-input bg-ring-offset-accent-foreground px-3 py-2
    text-base ring-offset-accent-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium
    file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed
    disabled:opacity-50 md:text-sm pl-10`;

    return (
        <>
            <div className="space-y-1 text-center">
                <div className="text-2xl font-bold">Welcome Back!</div>
                <div className="">Enter your credentials to gain access.</div>
            </div>
            <div className="my-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="username" {...register("username", {
                                    required: "username is required",
                                    minLength: {
                                        value: 8,
                                        message: "Username must have 8 characters"
                                    },
                                })} type="text"
                                placeholder="username"
                            />
                        </div>
                        {
                            errors.username && (
                                <div className="text-red-500">{errors.username.message}</div>
                            )
                        }
                        <label htmlFor="password">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="password" {...register("password", {
                                    required: "password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must have 8 characters"
                                    },
                                })} type="password"
                                placeholder="password"
                            />
                        </div>
                        {
                            errors.password && (
                                <div className="text-red-500">{errors.password.message}</div>
                            )
                        }

                        <span className="flex justify-between mt-4">
                            <NavLink to={"/auth/reset-password"} className={"text-sm text-primary hover:underline"}>Forgot password?</NavLink>
                            <NavLink to={"/auth/signup"} className={"text-sm text-primary hover:underline"}>Signup?</NavLink>
                        </span>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                        </Button>
                        {
                            errors.root && (
                                <div className="text-red-500">{errors.root.message}</div>
                            )
                        }
                    </div>
                </form>
            </div>
        </>
    )
}

export default Login