import { useState } from "react";
import { useLogin } from "@refinedev/core";
import AuthPage from "../components/AuthPage.jsx";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { mutate: login } = useLogin();

  function handleSubmit(event) {
    event.preventDefault();
    login(
      { email, password },
      {
        onSuccess: (result) => {
          if (!result.success) setError(result.error.message);
        },
      }
    );
  }

  return (
    <AuthPage>
      <form onSubmit={handleSubmit} className="login">
        <Logo />
        <h1>Sign in</h1>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign in</button>
        {error && <p>{error}</p>}
      </form>
    </AuthPage>
  );
}
