import { useState } from "react";
import "./Login.css";

const API_URL = "http://localhost:5000";

export default function Login({ onBackHome }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function goHome() {
    if (onBackHome) {
      onBackHome();
    } else {
      window.history.pushState({}, "", "/");
      window.location.reload();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "signup" : "login";

      const body = isSignup
        ? { name, email, password, role }
        : { email, password };

      const response = await fetch(
        `${API_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Request failed");
      }

      if (!isSignup && data.token) {
        localStorage.setItem("agritech_token", data.token);

        if (data.user) {
          localStorage.setItem(
            "agritech_user",
            JSON.stringify(data.user)
          );
        }

        setMessage("Login successful! You are now logged in.");

        setTimeout(() => {
          window.history.pushState({}, "", "/");
          window.location.reload();
        }, 700);
      } else {
        setMessage(
          "Account created successfully! You can now log in."
        );
        setIsSignup(false);
        setPassword("");
      }
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>

        <p>
          {isSignup
            ? "Join the AgriTech farming community."
            : "Log in to your AgriTech account."}
        </p>

        {isSignup && (
          <>
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <label htmlFor="auth-role">I am a</label>
            <select
              id="auth-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </>
        )}

        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isSignup
              ? "Create Account"
              : "Login"}
        </button>

        {message && (
          <div className="auth-message" role="status">
            {message}
          </div>
        )}

        <p className="auth-switch">
          {isSignup
            ? "Already have an account?"
            : "New to AgriTech?"}{" "}

          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>

        <button
          type="button"
          className="auth-home"
          onClick={goHome}
        >
          Back to home
        </button>
      </form>
    </div>
  );
}