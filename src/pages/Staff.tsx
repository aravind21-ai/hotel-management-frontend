import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const API = import.meta.env.VITE_API_URL;
const ROLES = ["ADMIN", "RECEPTIONIST", "HOUSEKEEPING"];

function Staff() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RECEPTIONIST");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function authHeaders() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function fetchUsers() {
    try {
      const response = await axios.get(`${API}/users`, authHeaders());
      setUsers(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login");
      }
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await axios.post(`${API}/users`, { name, email, password, role }, authHeaders());
      setName("");
      setEmail("");
      setPassword("");
      setRole("RECEPTIONIST");
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      setError("Could not create staff account");
    }
  }

  async function toggleActive(user: StaffUser) {
    await axios.patch(`${API}/users/${user.id}`, { isActive: !user.isActive }, authHeaders());
    fetchUsers();
  }

  async function changeRole(user: StaffUser, newRole: string) {
    await axios.patch(`${API}/users/${user.id}`, { role: newRole }, authHeaders());
    fetchUsers();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl text-ink">Staff Management</h1>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary-hover">
          + Add Staff
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background text-ink-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 text-ink">{u.name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    className="border border-border rounded px-2 py-1 text-xs bg-surface"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? "bg-primary/10 text-primary" : "bg-red-100 text-red-600"}`}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)} className="text-xs text-primary hover:underline">
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-surface p-6 rounded-lg shadow-lg w-96 border border-border">
            <h2 className="text-lg font-semibold text-ink mb-4">Add Staff Account</h2>

            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" required />
            <input type="password" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-3 text-sm" required />

            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-border rounded px-3 py-2 mb-4 text-sm">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded border border-border text-ink-muted hover:bg-background">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary-hover">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Staff;