import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md dark:bg-dark-primary dark:text-dark-background dark:hover:bg-dark-primary/90",
        destructive:
          "bg-danger text-white hover:bg-danger/90 shadow-sm dark:bg-danger dark:text-white",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-white shadow-sm dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary dark:hover:text-dark-background",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90 shadow-sm dark:bg-dark-secondary dark:text-dark-text-main dark:hover:bg-dark-secondary/90",
        ghost:
          "hover:bg-secondary/20 hover:text-primary dark:hover:bg-dark-secondary/30 dark:hover:text-dark-primary",
        link: "text-primary underline-offset-4 hover:underline dark:text-dark-primary",
        cta: "bg-cta text-white hover:bg-cta/90 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold dark:bg-dark-cta dark:text-dark-background dark:hover:bg-dark-cta/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
