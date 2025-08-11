import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "rounded-lg bg-card-background text-text-heading border border-gray-200 shadow-sm transition-all duration-200 dark:bg-dark-card-background dark:text-dark-text-heading dark:border-gray-700",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg hover:shadow-xl",
        minimal: "border-0 shadow-none bg-transparent",
        light: "bg-card-background/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
