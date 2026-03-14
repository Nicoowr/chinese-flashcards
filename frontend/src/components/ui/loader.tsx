import { Spinner } from "@radix-ui/themes";
import { cn } from "../../lib/utils";

type LoaderProps = {
  className?: string;
};

const Loader = ({ className, ...props }: LoaderProps) => (
  <Spinner className={cn("animate-spin", className)} {...props} />
);

export { Loader };
