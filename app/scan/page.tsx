'use client';

import { useState, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

type BookResponse = {
  isbn: string;
  title: string;
  authors?: string[];
  publish_date?: string;
  // add any extra fields your route returns
};

function isLikelyIsbn13(code: string): boolean {
  // 13 digits, starts with Bookland prefix 978 or 979
  return /^\d{13}$/.test(code) && (code.startsWith('978') || code.startsWith('979'));
}

export default function UploadIsbnScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState<BookResponse | null>(null);
  const lastSubmitted = useRef<string | null>(null);

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget; // capture before any await
    const file = input.files?.[0];
    if (!file) return;

    setError('');
    setIsbn('');
    setBook(null);

    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      // ZXing hints: restrict to EAN_13 for ISBNs (faster/more reliable)
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
      // Optionally try harder for tricky photos:
      // hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      const result = await reader.decodeFromImageUrl(url);
      const code = result.getText().trim();

      if (!isLikelyIsbn13(code)) {
        setError(`Decoded code "${code}" doesn’t look like a valid ISBN-13 (expected 13 digits starting with 978/979).`);
        return;
      }

      setIsbn(code);

      // Avoid re-posting the same ISBN repeatedly
      if (lastSubmitted.current === code) return;
      lastSubmitted.current = code;

      setLoading(true);
      const res = await fetch(`/api/books?isbn=${encodeURIComponent(code)}`);
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `API error (status ${res.status})`);
      }
      const data: BookResponse = await res.json();
      setBook(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to process the image or save the book.');
      lastSubmitted.current = null; // allow retry on error
    } finally {
      setLoading(false);
      try { input.value = ''; } catch {}
      // Revoke after <img> loads to avoid race; see onLoad below
    }
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 560, margin: '0 auto' }}>
      <h2>Upload / Take a Photo of the Book Barcode</h2>
      <p style={{ marginTop: 8, marginBottom: 12 }}>
        Tip: Fill the frame with the barcode and keep it sharp (good light helps).
      </p>

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
            style={{ maxWidth: '100%', display: 'block', borderRadius: 8 }}
            onLoad={() => {
              // Safe to free the blob after the image element has consumed it
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

      {loading && <p style={{ marginTop: 12 }}>Looking up on OpenLibrary and saving to Google Sheets…</p>}

      {book && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3 style={{ margin: 0 }}>{book.title}</h3>
          <p style={{ margin: '6px 0' }}>
            <b>Author(s):</b> {book.authors?.length ? book.authors.join(', ') : '—'}
          </p>
          <p style={{ margin: '6px 0' }}>
            <b>Published:</b> {book.publish_date || '—'}
          </p>
          <p style={{ margin: '6px 0', color: '#16a34a' }}>
            ✅ Saved to Google Sheet
          </p>
        </div>
      )}

      {error && (
        <p style={{ marginTop: 12, color: 'crimson' }}>
          {error}
        </p>
      )}
    </div>
  );
}

