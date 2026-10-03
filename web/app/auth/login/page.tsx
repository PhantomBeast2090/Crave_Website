"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConsumerShell } from "@/components/consumer-shell";

const schema = z.object({
  email: z.string().email("Enter a valid campus email — did you miss the @?"),
  password: z.string().min(6, "Password needs 6+ characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Welcome back.</h1>
        <p className="text-ink-2 text-sm">Your usual is waiting.</p>
        <form className="mt-6 space-y-3" noValidate
          onSubmit={handleSubmit(async (v) => {
            setErr(null);
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const { isDemoMode } = await import("@/lib/supabase/env");
              if (isDemoMode) { router.push("/"); return; }
              const sb = createClient();
              const { error } = await sb.auth.signInWithPassword(v);
              if (error) throw error;
              router.push("/");
            } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't sign you in. Check your connection and retry."); }
          })}>
          <div>
            <label htmlFor="email" className="text-sm font-bold">Email address</label>
            <input id="email" type="email" inputMode="email" autoComplete="email" {...register("email")}
              className="mt-1 w-full h-12 px-4 rounded-m border border-line bg-surface" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
            {errors.email && <p id="email-err" className="text-sm text-error mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold">Password</label>
            <input id="password" type="password" autoComplete="current-password" {...register("password")}
              className="mt-1 w-full h-12 px-4 rounded-m border border-line bg-surface" aria-invalid={!!errors.password} aria-describedby={errors.password ? "pw-err" : undefined} />
            {errors.password && <p id="pw-err" className="text-sm text-error mt-1">{errors.password.message}</p>}
          </div>
          {err && <p role="alert" className="text-sm text-error bg-red-50 border border-red-200 rounded-m p-3">{err}</p>}
          <button disabled={isSubmitting} className="w-full h-12 rounded-m bg-accent text-accent-ink font-bold hover:bg-accent-deep disabled:opacity-60 min-h-11">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-sm text-ink-2">New here? <a href="/auth/register" className="underline font-bold text-ink">Create an account</a></p>
        </form>
      </div>
    </ConsumerShell>
  );
}
