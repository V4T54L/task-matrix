import { useForm, type SubmitHandler } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/Button";
import { IdCard, KeyRound, LogIn, Mail, User } from "lucide-react";
import { signup } from "../../api/auth";
import { useAuth } from "../../context/authProvider";
import { getErrorString } from "../../utils";
import { pfpUrls } from "../../mock/pfp_urls";
import { useState } from "react";

type FormFields = {
    name: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

const Signup = () => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormFields>()
    const { setupLogin } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState("")

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (data.password != data.confirm_password) {
            setError("confirm_password", {
                message: "Password and confirm password does not match",
            })
        }

        try {
            const { token, user } = await signup({ name: data.name, avatar_url: avatarUrl, username: data.username, email: data.email, password: data.password, confirm_password: data.confirm_password })
            setupLogin(user, token)
        } catch (error: unknown) {
            setError("root", {
                message: getErrorString(error),
            });
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
                <div className="text-2xl font-bold">Create an Account</div>
                <div className="text-wrap">Join TaskFlow to start managing your projects efficiently.</div>
            </div>
            <div className="border py-2 px-4 m-2 max-w-sm">
                <p className="font-semibold text-center">Choose your avatar</p>
                <div className="grid grid-cols-4 gap-4">
                    {
                        pfpUrls &&
                        pfpUrls.map(url => (
                            <img src={url} key={url} alt="pfp"
                                className={`rounded-full ${avatarUrl === url && "border border-4 border-blue-400"}`}
                                onClick={() => setAvatarUrl(url)}
                            />
                        ))
                    }
                </div>
            </div>
            <div className="my-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name">Name</label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="name" {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 8,
                                        message: "Name must have 8 characters"
                                    },
                                })} type="text"
                                placeholder="name"
                            />
                        </div>
                        {
                            errors.name && (
                                <div className="text-red-500">{errors.name.message}</div>
                            )
                        }
                        <label htmlFor="username">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="username" {...register("username", {
                                    required: "Username is required",
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
                        <label htmlFor="email">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="email" {...register("email", {
                                    required: "Email is required",
                                })} type="email"
                                placeholder="email"
                            />
                        </div>
                        {
                            errors.email && (
                                <div className="text-red-500">{errors.email.message}</div>
                            )
                        }
                        <label htmlFor="password">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="password" {...register("password", {
                                    required: "Password is required",
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
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                className={classnames}
                                id="confirm_password" {...register("confirm_password")} type="password"
                                placeholder="confirm_password"
                            />
                        </div>
                        {
                            errors.confirm_password && (
                                <div className="text-red-500">{errors.confirm_password.message}</div>
                            )
                        }

                        <span className="flex justify-start gap-2 mt-4">
                            <h3 className="text-sm">Already have an account.</h3>
                            <NavLink to={"/auth/login"} className={"text-sm text-primary hover:underline"}>Login?</NavLink>
                        </span>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign Up
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

export default Signup