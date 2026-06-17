import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-1 pt-20">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
