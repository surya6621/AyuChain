import{api}from"./api";
import { demoProduct } from "../data/demoProduct";
export async function getMyHerbs(token){return(await api("/api/herbs/my",{token})).herbs}
export async function getHerb(token,id){return(await api(`/api/herbs/${id}`,{token})).herb}
export async function getPublicHerb(id){
  if(String(id).toUpperCase()==="DEMO-AYU-001") {
    try { return await api("/api/herbs/public/DEMO-AYU-001"); }
    catch { return demoProduct; }
  }
  return api(`/api/herbs/public/${encodeURIComponent(id)}`);
}
export function createHerb(token,data){return api("/api/herbs",{token,method:"POST",body:JSON.stringify(data)})}
export function uploadLabReport(token, herbId, file){const body=new FormData();body.append("report",file);return api(`/api/herbs/${herbId}/lab-report`,{token,method:"POST",body})}
export function approveBatch(token, herbId, batchNumber){return api(`/api/herbs/${herbId}/approve`,{token,method:"POST",body:JSON.stringify({batchNumber})})}
export function updateStatus(token,id,status){return api(`/api/herbs/${id}/status`,{token,method:"PATCH",body:JSON.stringify({status})}
)}
