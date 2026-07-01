import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-wave text-2xl font-black text-black">M</span>
          <span className="text-2xl font-bold">MusicWave</span>
        </Link>
        <section className="rounded-lg border border-line bg-zinc-950 p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>
        </section>
      </div>
    </main>
  );
}
