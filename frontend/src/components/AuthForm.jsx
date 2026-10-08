import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";
import "../styles/Login.css";

const copy = {
  login: {
    kicker: "BEM-VINDO DE VOLTA",
    title: "Seu próximo capítulo.",
    text: "Entre e continue de onde sua curiosidade parou.",
    action: "Entrar na aventura",
  },
  register: {
    kicker: "O VALE ESPERA POR VOCÊ",
    title: "Toda jornada começa aqui.",
    text: "Crie sua conta e encontre o primeiro fragmento.",
    action: "Criar conta e explorar",
  },
  forgot: {
    kicker: "ENCONTRE SEU CAMINHO",
    title: "Vamos recuperar seu acesso.",
    text: "Informe o e-mail da sua conta para receber um link de recuperação.",
    action: "Enviar link de recuperação",
  },
  reset: {
    kicker: "UM NOVO COMEÇO",
    title: "Escolha uma nova senha.",
    text: "Use pelo menos 8 caracteres, com letras e números.",
    action: "Salvar nova senha",
  },
};

export function PasswordField({
  label = "Senha",
  name = "password",
  value,
  onChange,
  newPassword = false,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="form-label">
      {label}
      <span className="input-wrap">
        <LockKeyhole size={17} />
        <input
          required
          name={name}
          type={visible ? "text" : "password"}
          minLength={newPassword ? 8 : undefined}
          maxLength={128}
          value={value}
          onChange={onChange}
          autoComplete={newPassword ? "new-password" : "current-password"}
          placeholder={newPassword ? "Pelo menos 8 caracteres" : "Sua senha"}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

export default function AuthForm({ mode }) {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const content = copy[mode];

  if (user && !authLoading && (mode === "login" || mode === "register"))
    return <Navigate to="/aventura" replace />;

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if ((mode === "register" || mode === "reset") && form.password !== form.password_confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { data } = await api.post("/password/reset/", { email: form.email });
        setSuccess(data.message);
      } else if (mode === "reset") {
        const { data } = await api.post("/password/reset/confirm/", {
          ...params,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
        setSuccess(data.message);
      } else {
        const { data } = await api.post(mode === "register" ? "/register/" : "/login/", {
          ...form,
          email: form.email.trim().toLowerCase(),
        });
        login(data, remember);
        navigate("/aventura", { replace: true });
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-scene">
        <Link className="auth-home" to="/">
          <Logo light />
        </Link>
        <div className="auth-scene-copy">
          <span className="eyebrow">UMA HISTÓRIA. SEIS DESCOBERTAS.</span>
          <h1>
            Há um mundo
            <br />
            do outro lado
            <br />
            da curiosidade.
          </h1>
          <p>
            O mapa é só o começo.
            <br />A próxima descoberta é sua.
          </p>
        </div>
        <div className="auth-scene-footer">
          <span className="mini-compass">✦</span> Diário de Tutti-Frutti <span>CAP. 01 — 06</span>
        </div>
      </section>
      <section className="auth-panel">
        <Link className="back-link" to="/">
          <ArrowLeft size={16} /> Voltar ao vale
        </Link>
        <div className="auth-form-container">
          <span className="auth-icon">
            <LeafIcon mode={mode} />
          </span>
          <span className="eyebrow">{content.kicker}</span>
          <h2>{content.title}</h2>
          <p className="muted">{content.text}</p>
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <label className="form-label">
                Seu nome
                <span className="input-wrap">
                  <UserRound size={17} />
                  <input
                    required
                    name="name"
                    maxLength={150}
                    value={form.name}
                    onChange={change}
                    placeholder="Como podemos chamar você?"
                    autoComplete="name"
                  />
                </span>
              </label>
            )}
            {mode !== "reset" && (
              <label className="form-label">
                E-mail
                <span className="input-wrap">
                  <Mail size={17} />
                  <input
                    required
                    name="email"
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={change}
                    placeholder="voce@email.com"
                    autoComplete="email"
                  />
                </span>
              </label>
            )}
            {mode !== "forgot" && (
              <PasswordField
                value={form.password}
                onChange={change}
                newPassword={mode !== "login"}
              />
            )}
            {(mode === "register" || mode === "reset") && (
              <PasswordField
                label="Confirme sua senha"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={change}
                newPassword
              />
            )}
            {mode === "login" && (
              <div className="form-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />{" "}
                  Lembrar de mim
                </label>
                <Link to="/recuperar-senha">Esqueci a senha</Link>
              </div>
            )}
            {mode === "register" && (
              <p className="password-help">
                <ShieldCheck size={15} /> Combine letras e números. Evite senhas muito comuns.
              </p>
            )}
            {error && (
              <div className="notice notice--error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="notice notice--success" role="status">
                <Check size={17} />
                {success}
              </div>
            )}
            {!success && (
              <button
                className="button button--primary button--full"
                disabled={busy || authLoading}
              >
                {busy ? (
                  <>
                    <span className="spinner" /> Só um instante…
                  </>
                ) : (
                  <>
                    {content.action}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
            {success && (
              <Link className="button button--primary button--full" to="/login">
                Voltar para o login <ArrowRight size={17} />
              </Link>
            )}
          </form>
          <p className="auth-switch">
            {mode === "login" ? (
              <>
                Sua primeira visita? <Link to="/cadastro">Criar uma conta</Link>
              </>
            ) : mode === "register" ? (
              <>
                Já tem uma conta? <Link to="/login">Entrar na aventura</Link>
              </>
            ) : (
              <Link to="/login">Lembrei minha senha</Link>
            )}
          </p>
          <div className="auth-trust">
            <ShieldCheck size={14} /> Seu progresso guardado. Sua aventura sempre à mão.
          </div>
        </div>
        <small className="auth-copyright">TUTTI-FRUTTI · UM CONVITE À DESCOBERTA</small>
      </section>
    </main>
  );
}
function LeafIcon({ mode }) {
  return mode === "register" ? (
    <UserRound size={24} />
  ) : mode === "forgot" ? (
    <Mail size={24} />
  ) : (
    <LockKeyhole size={24} />
  );
}
