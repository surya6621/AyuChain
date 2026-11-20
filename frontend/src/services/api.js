export const API_URL=import.meta.env.VITE_API_URL||"http://localhost:5000";
export async function api(path,{token,...options}={}){
  let response;
  const isFormData = options.body instanceof FormData;
  const headers = { ...(token?{Authorization:`Bearer ${token}`}:{}) };
  if (!isFormData) headers["Content-Type"] = "application/json";
  try { response=await fetch(API_URL+path,{...options,headers}); }
  catch { throw Error(`Cannot reach AyuChain backend at ${API_URL}. Start the backend and configure backend/.env.`); }
  const data=await response.json().catch(()=>({message:"Backend returned an invalid response"}));
  if(!response.ok)throw Error(data.message||"Request failed");
  return data;
}
