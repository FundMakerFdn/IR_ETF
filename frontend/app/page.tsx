import DashboardLayout from "@/components/dashboard-layout"
import AllocationChart from "@/components/allocation-chart"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">ETF Chart</h1>
        <AllocationChart />
      </div>
    </DashboardLayout>
  )
}

