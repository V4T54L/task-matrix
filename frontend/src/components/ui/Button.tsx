import React from "react";

export type ButtonProps = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "sm" | "default" | "lg";
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
};

const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none";

const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4",
    lg: "h-11 px-6 text-base",
};

const variantClasses = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-input bg-white hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100",
    link: "text-primary underline hover:text-primary/80",
};

export const Button: React.FC<ButtonProps> = ({
    children,
    type = "button",
    variant = "default",
    size = "default",
    className = "",
    disabled = false,
    onClick,
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
};
