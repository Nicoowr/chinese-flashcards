import { ComponentPropsWithoutRef, ElementType, CSSProperties } from "react";
import { cn } from "../../lib/utils";

type BoxProps<T extends ElementType = "div"> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export const Box = <T extends ElementType = "div">({
  as,
  className,
  ...props
}: BoxProps<T>) => {
  const Component = as ?? "div";

  return <Component className={cn(className)} {...props} />;
};

type StackProps<T extends ElementType = "div"> = BoxProps<T> & {
  gap?: CSSProperties["gap"];
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
};

export const HStack = <T extends ElementType = "div">({
  as,
  className,
  style,
  gap,
  justifyContent,
  alignItems,
  ...props
}: StackProps<T>) => {
  const Component = as ?? "div";

  return (
    <Component
      className={cn("flex flex-row", className)}
      style={{ ...style, gap, justifyContent, alignItems }}
      {...props}
    />
  );
};

export const VStack = <T extends ElementType = "div">({
  as,
  className,
  style,
  gap,
  justifyContent,
  alignItems,
  ...props
}: StackProps<T>) => {
  const Component = as ?? "div";

  return (
    <Component
      className={cn("flex flex-col", className)}
      style={{ ...style, gap, justifyContent, alignItems }}
      {...props}
    />
  );
};

export const Body = <T extends ElementType = "span">({
  as,
  className,
  ...props
}: BoxProps<T>) => {
  const Component = as ?? "span";

  return <Component className={cn(className)} {...props} />;
};
