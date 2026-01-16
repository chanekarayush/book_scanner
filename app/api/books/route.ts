import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get('isbn');
  if (!isbn) return NextResponse.json({ error: 'ISBN missing' }, { status: 400 });

  // --- Auth (with safe newline handling) ---
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GCP_PROJECT_ID,
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.includes('\\n')
        ? process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n')
        : process.env.GCP_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    return NextResponse.json({ error: 'Missing GOOGLE_SHEET_ID' }, { status: 500 });
  }

//  try {
//    const who = (await auth.getClient() as any)?.email || process.env.GCP_CLIENT_EMAIL;
//    console.log('Using service account:', who, 'Sheet ID:', sheetId);
//    await sheets.spreadsheets.get({ spreadsheetId: sheetId }); // should succeed if shared
//  } catch (e: any) {
//    console.error('Sheets GET failed:', e?.response?.data || e?.message);
//    return NextResponse.json({ error: 'Service account cannot access this spreadsheet. Did you share it as Editor?' }, { status: 403 });
//  }
//


  // --- 1️⃣ Fetch from OpenLibrary ---
  const openLibUrl = `https://openlibrary.org/isbn/${isbn}.json`;
  const response = await fetch(openLibUrl);
  if (!response.ok) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  const data = await response.json();

  const book = {
    isbn,
    title: data.title,
    authors: data.authors?.map((a: any) => a.name) ?? [],
    publish_date: data.publish_date ?? 'N/A',
  };

  // --- 2️⃣ Save to Google Sheets ---
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GCP_PROJECT_ID,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GCP_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID!;
    

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [book.isbn, book.title, book.authors.join(', '), book.publish_date],
        ],
      },
    });
  } catch (e: any) {
    console.error(e);
  }

  return NextResponse.json(book);
}

