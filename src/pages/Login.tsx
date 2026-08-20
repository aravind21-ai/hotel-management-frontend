import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-surface p-8 rounded-lg shadow-sm border border-border w-80"
      >
        <h1 className="font-serif text-2xl text-ink mb-4">Grandview</h1>
        <p className="text-sm text-ink-muted mb-6">Staff Login</p>
    
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 mb-3 text-sm bg-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 mb-4 text-sm bg-white"
        />

        <button
          type="submit"
          className="w-full bg-primary text-white rounded py-2 text-sm font-medium hover:bg-primary-hover"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;