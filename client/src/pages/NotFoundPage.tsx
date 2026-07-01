import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-center text-white">
      <div>
        <p className="text-sm font-semibold text-wave">404</p>
        <h1 className="mt-2 text-4xl font-black">Page not found</h1>
        <Link className="mt-6 inline-flex h-11 items-center rounded-lg bg-wave px-5 font-semibold text-black" to="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
