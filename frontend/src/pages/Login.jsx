import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [visible, setVisible] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await api.post("/login/", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      saveAuth(response.data.access, response.data.refresh, response.data.user);
      navigate("/", { replace: true });
    } catch (error) {
      setErro(error.response?.data?.erro || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="page login-page">
      <button className="back-button" onClick={() => navigate("/")}><ArrowLeft size={19} /> Voltar</button>
      <section className="login-visual">
        <Logo />
        <div className="login-quote"><Sparkles size={17} /><p>“Cada pista nos deixa mais perto de descobrir o segredo.”</p><small>— Diário de Tutti-Frutti</small></div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="mini-icon"><LockKeyhole size={25} /></div>
          <div className="login-heading"><small>BEM-VINDO DE VOLTA!</small><h2>Continue sua aventura</h2><p>Entre para voltar ao ponto onde parou.</p></div>
          <label>E-mail<div className="field"><Mail size={18} /><input required name="email" type="email" value={form.email} onChange={handleChange} placeholder="seunome@email.com" autoComplete="email" /></div></label>
          <label>Senha<div className="field"><LockKeyhole size={18} /><input required name="password" type={visible ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Digite sua senha" autoComplete="current-password" /><button type="button" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          <div className="form-options"><label className="check"><input type="checkbox" /><span>Lembrar de mim</span></label><button type="button">Esqueci minha senha</button></div>
          {erro && <span className="erro">{erro}</span>}
          <button className="primary-button full" type="submit" disabled={carregando}>{carregando ? "Entrando..." : <>Entrar na aventura <ArrowRight size={19} /></>}</button>
          <p className="signup">Ainda não tem uma conta? <button type="button">Criar conta</button></p>
        </form>
      </section>
    </main>
  );
}
