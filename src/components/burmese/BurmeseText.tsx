import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "h1" | "h2";
};

export function BurmeseText({ children, className, as: Tag = "span" }: Props) {
  return (
    <Tag
      className={cn(
        "font-burmese leading-[1.6] pt-1 pb-1 align-baseline break-words",
        className
      )}
      lang="my"
    >
      {children}
    </Tag>
  );
}
