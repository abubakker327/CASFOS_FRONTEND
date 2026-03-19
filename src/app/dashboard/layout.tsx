import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full relative z-10 overflow-hidden bg-[#f9fafb]">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-screen max-w-[calc(100vw-220px)]">
        <Header />
        <main className="flex-1 overflow-y-auto w-full bg-[#f9fafb]">
          {children}
        </main>
      </div>
    </div>
  );
}
