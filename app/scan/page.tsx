// app/scan/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid any SSR access to window/navigator at import time
const loadZXing = () => import('@zxing/browser');

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<'idle'|'ok'|'no-https'|'no-camera'|'error'>('idle');
  const [msg, setMsg] = useState('');
  const [isbn, setIsbn] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // 1) Secure context check (required on iOS Safari)
        const isSecure = window.isSecureContext || location.protocol === 'https:';
        if (!isSecure && location.hostname !== 'localhost') {
          setStatus('no-https');
          setMsg('Camera requires HTTPS (or localhost).');
          return;
        }

        // 2) Feature check
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('no-camera');
          setMsg('Camera API not available. Open in Safari and allow camera.');
          return;
        }

        // 3) Load ZXing on client
        const { BrowserMultiFormatReader, BarcodeFormat } = await loadZXing();

        const codeReader = new BrowserMultiFormatReader();
        const stop = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' }, // back camera on iPhone
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            // Restrict to EAN_13 for ISBN-13
            formats: [BarcodeFormat.EAN_13],
          } as any,
          videoRef.current!,
          (result, err) => {
            if (result) setIsbn(result.getText());
            // ignore continuous decode errors while scanning
          }
        );

        setStatus('ok');

        return () => {
          try { stop && stop(); } catch {}
        };
      } catch (e: any) {
        setStatus('error');
        setMsg(e?.message || 'Unexpected error starting camera.');
        console.error(e);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Scan ISBN (EAN-13)</h2>
      <video
        ref={videoRef}
        style={{ width: '100%', maxWidth: 480, borderRadius: 8 }}
        muted
        playsInline
        autoPlay
      />
      <p style={{ marginTop: 12 }}>
        {isbn ? <>Scanned: <b>{isbn}</b></> :
          status === 'ok' ? 'Point camera at the barcode' :
          status === 'no-https' ? 'Needs HTTPS (or localhost).' :
          status === 'no-camera' ? 'Camera not available. Open in Safari and allow camera.' :
          status === 'error' ? msg :
          'Initializing camera...'}
      </p>
    </div>
  );
}

