import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { ward_name } = await req.json();
    if (!ward_name) {
      return NextResponse.json({ success: false, error: 'ward_name required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    // Try Firebase Admin write
    try {
      const { db } = await import('@/lib/firebaseAdmin');
      const docId = ward_name.replace(/\s+/g, '_').toLowerCase();
      await db.collection('wards').doc(docId).set(
        { action_taken: true, dispatched_at: timestamp, ward_name },
        { merge: true }
      );
    } catch (fbErr) {
      console.warn('Firebase Admin not configured, skipping write:', fbErr);
    }

    return NextResponse.json({
      success: true,
      ward_name,
      dispatched_at: timestamp,
      message: `Action dispatched for ${ward_name}`,
    });
  } catch (error) {
    console.error('Dispatch error:', error);
    return NextResponse.json({ success: false, error: 'Dispatch failed' }, { status: 500 });
  }
}
