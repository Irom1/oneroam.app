import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{APP_NAME}</p>
        <p className="mt-1">
          Travel eSIM. Instant delivery, global coverage.
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
