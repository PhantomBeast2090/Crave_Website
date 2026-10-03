import { OpsShell, Kpi, ChartCard } from "@/components/ops-shell";
export default function P() {
  return (
    <OpsShell title="Management · inventory" sub="Campus command centre — server-aggregated, role-guarded.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Orders" value="1,284" delta="+6%" />
        <Kpi label="Revenue" value="₹1.9L" delta="+4%" />
        <Kpi label="Active outlets" value="5/6" />
        <Kpi label="Repeat rate" value="38%" />
      </div>
      <div className="mt-3"><ChartCard title="inventory overview" empty="Rankings, trends and drill-downs query get_management_analytics + daily/hourly views when Supabase is live." /></div>
    </OpsShell>
  );
}
