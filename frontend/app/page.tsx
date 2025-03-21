import DashboardLayout from "@/components/dashboard-layout";
import APYChart from "@/components/charts/apy-chart/apy-chart";
import ETFChart from "@/components/charts/etf-chart/etf-chart";

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="container py-6 flex items-center justify-between grid">
        <div className="p-2 grid-cols-6">
          <h1 className="text-2xl font-bold mb-6">APY Chart</h1>
          <APYChart />
        </div>
        <div className="p-2 grid-cols-6">
          <h1 className="text-2xl font-bold mb-6">ETF Index Chart</h1>
          <ETFChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
