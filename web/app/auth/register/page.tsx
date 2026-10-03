"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConsumerShell } from "@/components/consumer-shell";

const schema = z.object({
  name: z.string().min(2, "Tell us your name (2+ characters)."),
  email: z.string().email("Enter a valid campus email."),
  password: z.string().min(8, "8+ characters — show requirements upfront, not as an error later."),
});

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (done) return <ConsumerShell><div className="mx-auto max-w-md px-4 py-16 text-center"><h1 className="font-display text-3xl font-bold">Check your inbox.</h1><p className="text-ink-2">Verify your email, then your student profile is created (RLS: STUDENT only — never ADMIN from client).</p></div></ConsumerShell>;
  return (
    <ConsumerShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Join CRAVE.</h1>
        <p className="text-ink-2 text-sm">One account for every canteen on campus.</p>
        <form className="mt-6 space-y-3" noValidate onSubmit={handleSubmit(async (v) => {
          setErr(null);
          try {
            const { isDemoMode } = await import("@/lib/supabase/env");
            if (isDemoMode) { setDone(true); return; }
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            const { error } = await sb.auth.signUp({ email: v.email, password: v.password, options: { data: { name: v.name, requested_role: "STUDENT" } } });
            if (error) throw error;
            setDone(true);
          } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't create your account. Nothing was lost — retry."); }
        })}>
          {(["name", "email", "password"] as const).map((f) => (
            <div key={f}>
              <label htmlFor={f} className="text-sm font-bold capitalize">{f === "name" ? "Full name" : f === "email" ? "Email address" : "Password"}</label>
              <input id={f} type={f === "password" ? "password" : f === "email" ? "email" : "text"}
                autoComplete={f === "password" ? "new-password" : f === "email" ? "email" : "name"} {...register(f)}
                className="mt-1 w-full h-12 px-4 rounded-m border border-line bg-surface" aria-invalid={!!errors[f]} />
              {errors[f] && <p className="text-sm text-error mt-1">{errors[f]?.message}</p>}
            </div>
          ))}
          {err && <p role="alert" className="text-sm text-error bg-red-50 border border-red-200 rounded-m p-3">{err}</p>}
          <button disabled={isSubmitting} className="w-full h-12 rounded-m bg-ink text-white font-bold disabled:opacity-60 min-h-11">
            {isSubmitting ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </ConsumerShell>
  );
}
