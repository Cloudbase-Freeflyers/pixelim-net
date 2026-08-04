import AdminNav from "@/components/admin/AdminNav";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminShell({ children, title }: AdminShellProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="font-bold text-gray-900 text-base">Pixelim</div>
          <div className="text-xs text-gray-400 mt-0.5">Admin Panel</div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>

        <div className="px-3 py-4 border-t border-gray-100">
          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
