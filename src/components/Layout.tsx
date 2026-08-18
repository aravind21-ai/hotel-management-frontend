import { NavLink, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/rooms", label: "Rooms" },
  { to: "/guests", label: "Guests" },
  { to: "/reservations", label: "Reservations" },
];
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 bg-surface border-r border-border flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <h1 className="font-serif text-xl text-ink">Grandview</h1>
          <p className="text-xs text-ink-muted mt-0.5">Staff Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-ink-muted hover:bg-background hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          {user && (
            <p className="text-xs text-ink-muted mb-2">
              {user.name} · {user.role}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-ink-muted hover:text-ink underline"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

export default Layout;