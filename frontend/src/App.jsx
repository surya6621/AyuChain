import { useEffect, useState } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import Journey from "./components/home/Journey";
import AuthPage from "./components/pages/AuthPage";
import WorkerPage from "./components/pages/WorkerPage";
import AdminPage from "./components/pages/AdminPage";
import VerifyPage from "./components/pages/VerifyPage";
import AdminLoginPage from "./components/pages/AdminLoginPage";
import { getSession, clearSession } from "./services/session";
import { translations } from "./i18n/translations";

function path() { return window.location.hash.replace("#", "") || "/"; }
export default function App() { const [route, setRoute] = useState(path); const [session, setSession] = useState(getSession); const [language, setLanguage] = useState(localStorage.getItem("ayuchain_language") || "en"); const t = translations[language]; const go = (next) => { window.location.hash = next; }; useEffect(() => { const change = () => setRoute(path()); window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, []); useEffect(() => { localStorage.setItem("ayuchain_language", language); document.documentElement.lang = language; }, [language]); const logout = () => { clearSession(); setSession(null); go("/"); }; let page; if (route === "/login") page = <AuthPage onLogin={setSession} go={go}/>; else if (route === "/register") page = <AuthPage registerMode onLogin={setSession} go={go}/>; else if (route === "/admin/login") page = <AdminLoginPage onLogin={setSession} go={go}/>; else if (route === "/worker") page = <WorkerPage session={session} go={go}/>; else if (route === "/admin") page = <AdminPage session={session} go={go}/>; else if (route === "/verify") page = <VerifyPage/>; else page = <><Hero t={t} onWallet={() => {}}/><Journey t={t}/><section className="role-links"><article><span>01</span><h2>Admin</h2><p>Manage all system changes, users, and batches.</p><button className="primary" onClick={() => go("/admin/login")}>Admin login</button></article><article><span>02</span><h2>Workers</h2><p>Farmer, Gatherer, Tester, and Manufacturer work queues.</p><button className="primary" onClick={() => go("/worker")}>Open worker portal</button></article><article><span>03</span><h2>Customer</h2><p>Scan a product QR code and view its certificate.</p><button className="primary" onClick={() => go("/verify")}>Verify product</button></article></section></>; return <><Header t={t} language={language} setLanguage={setLanguage} session={session} go={go} onLogout={logout}/><main>{page}</main><Footer t={t}/></>; }
