"use client";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
export default function P() {
  const { session, loading } = useSession();
  if (!loading && !session) return <OpsShell title="notifications" sub="Sign in."><RequireSignIn action="open notifications" /></OpsShell>;
  return (
    <OpsShell title="notifications" sub="Management section.">
      <ChartCard title="notifications" empty="No dedicated backend table backs this section yet — broadcast center, helpdesk and audit log land with the operations migration. Nothing here is fabricated." />
    </OpsShell>
  );
}
