import { useState } from "react";
import { login } from "../../services/auth";
import { clearSession } from "../../services/session";

export default function AdminLoginPage({ onLogin, go }) {
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    try {
      const session = await login(Object.fromEntries(new FormData(event.currentTarget)));
      if (session.user.role !== "admin") {
        clearSession();
        return setMessage("This account is not an administrator. Use the worker sign-in page.");
      }
      onLogin(session);
      go("/admin");
    } catch (error) { setMessage(error.message); }
  }
  return <section className="admin-login"><div className="admin-login-copy"><p className="eyebrow">RESTRICTED ACCESS</p><h1>Administrator sign in</h1><p>This portal is only for authorized AyuChain administrators. It provides access to people, role management, and all product batches.</p><div className="admin-demo"><b>Demo admin account</b><span>Email: admin@ayuchain.local</span><span>Password: Admin@2026</span></div></div><form className="admin-login-card" onSubmit={submit}><h2>Admin login</h2><label>Email<input name="email" type="email" required placeholder="admin@ayuchain.local"/></label><label>Password<input name="password" type="password" required placeholder="Enter password"/></label><button className="primary">Open admin panel</button><small>{message}</small><button type="button" className="link-button" onClick={() => go("/login")}>Use regular login</button></form></section>;
}
