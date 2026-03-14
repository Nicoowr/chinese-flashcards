import { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type LoaderProps = ComponentPropsWithoutRef<"span"> & {
  className?: string;
};

const Loader = ({ className, ...props }: LoaderProps) => (
  <span
    aria-hidden
    className={cn(
      "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
      className
    )}
    {...props}
  />
);

export { Loader };
