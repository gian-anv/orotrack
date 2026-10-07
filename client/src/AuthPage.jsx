import heroImage from "./assets/hero.svg";

export default function AuthPage({ children }) {
  return (
    <div className="auth">
      <div className="auth-hero">
        <img src={heroImage} alt="" />
        <h2>Every /r/, /s/, and /l/ between sessions.</h2>
        <p>
          Upload a practice log and review each production by target sound, word position, and date.
        </p>
      </div>
      <div className="auth-form">{children}</div>
    </div>
  );
}
