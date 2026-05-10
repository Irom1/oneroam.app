import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{APP_NAME}</p>
        <p className="mt-1">Instant travel eSIM. Apple Pay & Google Pay.</p>
        <p className="mt-4">&copy; {new Date().getFullYear()} {APP_NAME}.</p>
      </div>
    </footer>
  );
}
