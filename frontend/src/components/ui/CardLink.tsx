import Link from "next/link";
import { cardClassName } from "./Card";

type CardLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function CardLink({ href, className, children }: CardLinkProps) {
  return (
    <Link
      href={href}
      className={cardClassName({ variant: "interactive", className })}
    >
      {children}
    </Link>
  );
}
