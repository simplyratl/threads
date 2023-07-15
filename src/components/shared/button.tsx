import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "minimal" | "outline";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  className,
  variant = "default",
  ...rest
}: ButtonProps) => {
  const outlineClass =
    variant === "outline"
      ? "border border-foreground bg-transparent hover:bg-accent hover:bg-opacity-10"
      : "border-transparent bg-accent hover:opacity-60";

  const variantClass = variant === "default" ? "bg-accent" : "";
  const disabledClass = rest.disabled ? "opacity-50" : "";

  return (
    <button
      type="button"
      className={`${
        className ?? ""
      }  ${variantClass} ${outlineClass} ${disabledClass} rounded border px-4 py-0.5 transition-all`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
