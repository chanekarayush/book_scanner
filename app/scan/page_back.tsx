'use client';

import { useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function UploadIsbnScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;                  // <- capture BEFORE await
    const file = input.files?.[0];
    if (!file) return;

    setError('');
    setIsbn('');

    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      // Optional: improve robustness on tough images
      // hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      const result = await reader.decodeFromImageUrl(url);
      setIsbn(result.getText());
    } catch (err) {
      console.error(err);
      setError('Could not detect a valid ISBN barcode in the image.');
    } finally {
      // Reset the file input so the same file can be re-selected if needed
      try { input.value = ''; } catch {}
      // DO NOT revoke `url` here—wait for <img onLoad> to fire (see below)
    }
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Upload / Take a Photo of the Book Barcode</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
      />

      {preview && (
        <div style={{ marginTop: 12 }}>
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: '100%', display: 'block' }}
            onLoad={() => {
              // Safe place to revoke: after the <img> has consumed the blob
              try { URL.revokeObjectURL(preview); } catch {}
            }}
          />
        </div>
      )}

      {isbn && (
        <p style={{ marginTop: 12 }}>
          <b>ISBN-13:</b> {isbn}
        </p>
      )}

      {error && (
        <p style={{ marginTop: 12, color: 'crimson' }}>
          {error}
        </p>
      )}
    </div>
  );
}

