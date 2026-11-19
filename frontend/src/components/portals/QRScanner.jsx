import { useEffect, useRef, useState } from "react";

export default function QRScanner({ onDetected }) {
  const video = useRef(null); const [status, setStatus] = useState("Use your phone camera to scan the product QR code.");
  useEffect(() => () => video.current?.srcObject?.getTracks().forEach(track => track.stop()), []);
  async function scan() {
    if (!navigator.mediaDevices?.getUserMedia) return setStatus("Camera access is unavailable in this browser. Enter the batch ID instead.");
    if (!window.BarcodeDetector) return setStatus("QR scanning is not supported here. Use Chrome on mobile or enter the batch ID.");
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); video.current.srcObject = stream; await video.current.play(); setStatus("Point your camera at the QR code…"); const detector = new window.BarcodeDetector({ formats: ["qr_code"] }); const read = async () => { if (!video.current?.srcObject) return; const codes = await detector.detect(video.current); if (codes[0]?.rawValue) { stream.getTracks().forEach(track => track.stop()); onDetected(codes[0].rawValue.replace(/^.*\/(\d+)$/, "$1")); setStatus("QR code read successfully."); return; } requestAnimationFrame(read); }; read(); } catch { setStatus("Camera permission was not granted. Enter the batch ID instead."); }
  }
  return <div className="qr-scanner"><video ref={video} muted playsInline /><div className="qr-frame">⌗</div><button className="outline" onClick={scan}>Open camera scanner</button><small>{status}</small></div>;
}
