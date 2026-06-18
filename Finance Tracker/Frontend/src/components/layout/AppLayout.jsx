import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-1 pt-20">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}
