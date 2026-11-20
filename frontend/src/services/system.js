import { api } from "./api";
export async function getProfile(token) { return (await api("/api/users/profile", { token })).user; }
export async function getAdminDashboard(token) { return api("/api/admin/dashboard", { token }); }
export async function getAdminUsers(token) { return (await api("/api/admin/users", { token })).users; }
export async function getAdminBatches(token) { return (await api("/api/admin/batches", { token })).herbs; }
export async function changeUserRole(token, id, role) { return api(`/api/admin/users/${id}/role`, { token, method: "PATCH", body: JSON.stringify({ role }) }); }
export async function getWorkQueue(token) { return (await api("/api/herbs/queue", { token })).herbs; }
