'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, type IScannerControls } from '@zxing/browser';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<'idle'|'ok'|'no-https'|'no-camera'|'error'>('idle');
  const [isbn, setIsbn] = useState('');

  useEffect(() => {
    let controls: IScannerControls | undefined;

    (async () => {
      try {
        // HTTPS / localhost check (required for iOS camera)
        const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
        if (!isSecure) {
          setStatus('no-https');
          return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          setStatus('no-camera');
          return;
        }

        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            formats: [BarcodeFormat.EAN_13], // ISBN-13
          } as any,
          videoRef.current!,
          (result) => {
            if (result) setIsbn(result.getText());
          }
        );
        setStatus('ok');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    })();

    // Optional: stop camera when tab goes background (helps iOS)
    const onVisibility = () => { if (document.hidden) controls?.stop(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      controls?.stop(); // ✅ correct cleanup
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Scan ISBN (EAN-13)</h2>
      <video ref={videoRef} style={{ width: '100%', maxWidth: 480 }} muted playsInline autoPlay />
      <p style={{ marginTop: 12 }}>
        {isbn ? <>Scanned: <b>{isbn}</b></> :
         status === 'ok' ? 'Point camera at the barcode' :
         status === 'no-https' ? 'Needs HTTPS (or localhost).' :
         status === 'no-camera' ? 'Camera not available.' :
         status === 'error' ? 'Could not start camera.' :
         'Initializing...'}
      </p>
    </div>
  );
}

