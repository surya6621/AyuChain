import { useState } from "react";
import QRScanner from "./QRScanner";
import { getPublicHerb } from "../../services/herbs";

const workerRoles = { farmer: "Farmer", collector: "Gatherer", laboratory: "Tester / Laboratory", manufacturer: "Manufacturer" };
const stages = ["Farmer registers harvest", "Gatherer confirms collection", "Tester uploads quality report", "Manufacturer creates final product"];

export default function SystemPortals({ session, herbs, onNewHerb, onRefresh }) {
  const [view, setView] = useState("customer");
  const [batchId, setBatchId] = useState("");
  const [product, setProduct] = useState(null);
  const [notice, setNotice] = useState("");
  const role = session?.user?.role;

  async function verify(id = batchId) {
    if (!id) return;
    setNotice("Looking up product…");
    try { const data = await getPublicHerb(id); setProduct(data); setNotice(""); } catch (error) { setProduct(null); setNotice(error.message); }
  }
  return <section className="portals" id="portals"><div className="portal-intro"><p className="eyebrow">THREE ROLE SYSTEM</p><h2>One trusted chain, three clear workspaces.</h2><p>Every action has an owner. Every customer can verify the final product.</p></div><div className="portal-tabs"><button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>01 Admin</button><button className={view === "worker" ? "active" : ""} onClick={() => setView("worker")}>02 Workers</button><button className={view === "customer" ? "active" : ""} onClick={() => setView("customer")}>03 Customer</button></div>{view === "admin" && <AdminWorkspace session={session} herbs={herbs}/>} {view === "worker" && <WorkerWorkspace session={session} herbs={herbs} onNewHerb={onNewHerb} onRefresh={onRefresh}/>} {view === "customer" && <CustomerWorkspace batchId={batchId} setBatchId={setBatchId} product={product} notice={notice} verify={verify}/>}</section>;
}

function AdminWorkspace({ session, herbs }) { const admin = session?.user?.role === "admin"; return <div className="portal-card admin-card"><div><span className="role-tag">ADMIN CONTROL CENTER</span><h3>{admin ? `Welcome, ${session.user.name}` : "System administration"}</h3><p>{admin ? "You can oversee workers, batches, stage changes, certificates, and blockchain records." : "Admin access is restricted. Register or sign in with the admin role to manage the full system."}</p></div><div className="governance"><article><b>{herbs.length}</b><span>Visible batches</span></article><article><b>4</b><span>Worker stages</span></article><article><b>All</b><span>Change approval</span></article></div><div className="admin-checklist"><span>✓ Approve worker profiles</span><span>✓ Review stage handoffs</span><span>✓ Manage product certificates</span><span>✓ Monitor chain records</span></div></div> }

function WorkerWorkspace({ session, herbs, onNewHerb }) { const role = session?.user?.role; const label = workerRoles[role]; return <div className="portal-card worker-card"><div><span className="role-tag">WORKER WORKSPACE</span><h3>{label ? `${label} profile: ${session.user.name}` : "Register your worker profile"}</h3><p>{label ? "Your verified work is recorded as part of the product’s traceable history." : "Choose Farmer, Gatherer, Tester / Laboratory, or Manufacturer when creating your account. Sign in before doing work."}</p>{role === "farmer" ? <button className="primary" onClick={onNewHerb}>Register a harvest</button> : <button className="outline" onClick={() => document.querySelector("#dashboard")?.scrollIntoView()}>Open my work queue</button>}</div><div className="handoff"><p>PRODUCT HANDOFF</p>{stages.map((stage, index) => <div className={role && ((role === "farmer" && index === 0) || (role === "collector" && index === 1) || (role === "laboratory" && index === 2) || (role === "manufacturer" && index === 3)) ? "current" : ""} key={stage}><i>{index + 1}</i><span>{stage}</span></div>)}</div></div> }

function CustomerWorkspace({ batchId, setBatchId, product, notice, verify }) { return <div className="portal-card customer-card"><div><span className="role-tag">PUBLIC PRODUCT VERIFICATION</span><h3>Scan a QR code to see the full product story.</h3><p>No account is needed. The product page shows origin, supply-chain status, and the certificate when uploaded.</p><div className="verify-input"><input value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="Enter batch ID, e.g. 1" /><button className="primary" onClick={() => verify()}>Verify product</button></div><p className="notice">{notice}</p></div><QRScanner onDetected={(id) => { setBatchId(id); verify(id); }}/>{product && <article className="product-result"><span>✓ VERIFIED BATCH #{product.herb.id}</span><h4>{product.herb.name}</h4><dl><div><dt>Origin</dt><dd>{product.herb.origin || "Not recorded"}</dd></div><div><dt>Current stage</dt><dd>{product.herb.status}</dd></div><div><dt>Registered</dt><dd>{new Date(product.herb.created_at).toLocaleDateString()}</dd></div></dl><p>{product.herb.description || "No product description has been added."}</p><button className="certificate" disabled={!product.certificate.available}>Certificate {product.certificate.available ? "↓" : "coming after IPFS upload"}</button></article>}</div> }
