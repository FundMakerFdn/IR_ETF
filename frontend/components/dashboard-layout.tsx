import Header from "./layout/Header"
import Footer from "./layout/Hooter"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17] flex justify-center items-center">
      <Header />
      <main className="max-w-[1440px] flex-1 bg-[#0a0e17] text-white">
        {children}
      </main>
      <Footer />
    </div>
  )
}
