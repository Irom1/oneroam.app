import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found.</p>
      <Link
        href="/"
        className={cn(buttonVariants(), "mt-6 no-underline")}
      >
        Go Home
      </Link>
    </div>
  );
}
