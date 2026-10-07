import { useState } from "react";
import { useRegister } from "@refinedev/core";
import { Link } from "react-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { mutate: register } = useRegister();

  function handleSubmit(event) {
    event.preventDefault();
    register(
      { email, password },
      {
        onSuccess: (result) => {
          if (!result.success) setError(result.error.message);
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="login">
      <h1>Create account</h1>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password (at least 8 characters)" value={password}
        onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      <button type="submit">Create account</button>
      {error && <p>{error}</p>}
      <div className="hint">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </form>
  );
}
