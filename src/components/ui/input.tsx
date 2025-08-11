import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-secondary bg-background px-4 py-3 text-base text-text-main ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-main placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 hover:border-secondary/70 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-dark-border dark:bg-dark-secondary dark:text-dark-text-main dark:placeholder:text-dark-text-secondary dark:focus-visible:ring-dark-cta dark:hover:border-dark-border/70",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
