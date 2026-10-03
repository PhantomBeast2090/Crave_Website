import Link from "next/link";
import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
export default function P() {
  return (
    <OpsShell title="Management overview" sub="The entire campus in one command centre.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total orders" value="12,408" delta="+6%" />
        <Kpi label="Revenue" value="₹18.2L" delta="+4%" />
        <Kpi label="Students" value="8,214" />
        <Kpi label="Vendors" value="14" />
        <Kpi label="Active orders" value="23" />
        <Kpi label="AOV" value="₹147" />
        <Kpi label="Cancels" value="1.8%" />
        <Kpi label="Refunds" value="₹4,120" />
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <ChartCard title="Campus revenue trend" empty="Area chart over daily_metrics when Supabase is live." />
        <ChartCard title="Outlet ranking" empty="Revenue + volume leaderboard with drill-down." />
      </div>
      <p className="mt-3 text-sm"><Link href="/management/analytics" className="underline font-bold">Open analytics →</Link></p>
    </OpsShell>
  );
}
