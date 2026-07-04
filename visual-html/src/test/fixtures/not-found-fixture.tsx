import { Link } from "@tanstack/react-router";

/** Mirrors __root NotFoundComponent button contract for tests. */
export function NotFoundComponent() {
  return (
    <div>
      <h1>404</h1>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Go home
      </Link>
    </div>
  );
}
