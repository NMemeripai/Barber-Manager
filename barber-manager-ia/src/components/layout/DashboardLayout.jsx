import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ title, children }) {
  return (
    <div className="flex h-screen bg-surface-subtle">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
