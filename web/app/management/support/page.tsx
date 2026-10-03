"use client";
import { OpsShell, ChartCard } from "@/components/ops-shell";
import { useSession, RequireSignIn } from "@/lib/data/authed";
export default function P() {
  const { session, loading } = useSession();
  if (!loading && !session) return <OpsShell title="support" sub="Sign in."><RequireSignIn action="open support" /></OpsShell>;
  return (
    <OpsShell title="support" sub="Management section.">
      <ChartCard title="support" empty="No dedicated backend table backs this section yet — broadcast center, helpdesk and audit log land with the operations migration. Nothing here is fabricated." />
    </OpsShell>
  );
}
