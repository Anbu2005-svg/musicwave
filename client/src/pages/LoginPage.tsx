import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi, getErrorMessage } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import AuthShell from "./AuthShell";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  if (token) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const session = await authApi.signup({ name, email, password });
        setSession(session.user, session.token);
        showToast("Account created successfully!");
      } else {
        const session = await authApi.login({ email, password });
        setSession(session.user, session.token);
      }
      navigate(from, { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={isSignUp ? "Create an account" : "Welcome back"}
      subtitle={
        isSignUp
          ? "Sign up with your email to start listening and saving your favorite tracks."
          : "Sign in to keep your playlists, likes, and queue close."
      }
      footer={
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-wave hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      }
    >
      <div className="mb-6 flex rounded-lg border border-line bg-zinc-900/80 p-1">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`w-1/2 rounded-md py-2 text-sm font-semibold transition ${
            !isSignUp ? "bg-wave text-black shadow" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`w-1/2 rounded-md py-2 text-sm font-semibold transition ${
            isSignUp ? "bg-wave text-black shadow" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignUp && (
          <label className="block text-sm font-medium">
            Full Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Alex Rivera"
              className="mt-2 h-11 w-full rounded-lg border border-line bg-zinc-900 px-3 outline-none focus:border-wave"
              required
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="mt-2 h-11 w-full rounded-lg border border-line bg-zinc-900 px-3 outline-none focus:border-wave"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSignUp ? "Min 6 characters" : "Enter password"}
            className="mt-2 h-11 w-full rounded-lg border border-line bg-zinc-900 px-3 outline-none focus:border-wave"
            required
            minLength={isSignUp ? 6 : 1}
          />
        </label>
        <button
          className="h-11 w-full rounded-lg bg-wave font-semibold text-black hover:brightness-110 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
