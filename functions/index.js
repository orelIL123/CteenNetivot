import { onRequest } from 'firebase-functions/v2/https';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const CHABAD_DAILY_URL = 'https://www.chabad.org.il/Lessons/Lessons.asp?CategoryID=175';

if (!getApps().length) {
  initializeApp();
}

/**
 * מחזיר את שיעורי הלימוד היומיים מאתר chabad.org.il.
 * קורא את דף הלימוד היומי ומחלץ קישורים לפי סוג (חומש, תהלים, תניא וכו').
 * אין API רשמי — יש לגשת לאתר בצורה מכובדת (לא להציף בבקשות).
 */
export const chabadDailyLessons = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      const response = await fetch(CHABAD_DAILY_URL, {
        headers: { 'User-Agent': 'CTeenNetivot/1.0 (Chabad daily lessons)' },
      });
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const html = iconv.decode(buffer, 'win1255');

      const lessons = parseLessonsFromHtml(html);
      res.set('Cache-Control', 'public, max-age=3600'); // שעה
      res.json({ lessons, source: CHABAD_DAILY_URL });
    } catch (e) {
      console.error('chabadDailyLessons', e);
      res.status(500).json({ error: 'Failed to fetch daily lessons', lessons: [] });
    }
  }
);

/**
 * מחלץ מהדף טבלה עם "סוג הלימוד" ו"השיעור" — מחזיר מערך { type, title, url }.
 * האתר מחזיר HTML עם לינקים כמו /Lessons/Chumash.asp?...
 */
function parseLessonsFromHtml(html) {
  const lessons = [];
  const baseUrl = 'https://www.chabad.org.il';
  const $ = cheerio.load(html);

  const typeByPath = {
    'Chumash.asp': 'חומש',
    'Thilim.asp': 'תהלים',
    'Tanya.asp': 'תניא',
    'Yom.asp': 'היום-יום',
    'Rambam3.asp': 'רמב"ם 3 פרקים',
    'Rambam1.asp': 'רמב"ם פרק',
    'RambamMitzvot.asp': 'ספר המצוות',
  };

  const seen = new Set();

  $('a').each((i, el) => {
    const path = $(el).attr('href');
    if (!path || !path.includes('/Lessons/')) return;

    let title = $(el).text().trim().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
    if (!title || title.length < 2 || title === 'לימוד יומי' || title === '<< לשיעור הקודם' || title === 'לשיעור הבא >>') return;
    if (['חומש', 'תהלים', 'תניא', 'היום-יום'].includes(title) || title.includes('רמב"ם') || title.includes('ספר המצוות')) return;

    const fullUrl = path.startsWith('http') ? path : baseUrl + path;
    const type = Object.entries(typeByPath).find(([key]) => path.includes(key))?.[1] || 'שיעור';

    const key = `${type}:${title.slice(0, 50)}`;
    if (seen.has(key)) return;
    seen.add(key);

    lessons.push({ type, title, url: fullUrl });
  });

  return lessons;
}

export const accountDeletionRequest = onRequest(
  { cors: true, region: 'us-central1' },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const fullName = String(req.body?.fullName ?? '').trim();
    const phone = String(req.body?.phone ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const uid = String(req.body?.uid ?? '').trim();
    const reason = String(req.body?.reason ?? '').trim();

    if (!fullName || !phone) {
      res.status(400).json({ error: 'fullName and phone are required' });
      return;
    }

    try {
      const db = getFirestore();
      const docRef = await db.collection('accountDeletionRequests').add({
        fullName,
        phone,
        email: email || null,
        uid: uid || null,
        reason: reason || null,
        source: 'firebase-hosting-form',
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        ok: true,
        id: docRef.id,
        message: 'Deletion request submitted successfully',
      });
    } catch (error) {
      console.error('accountDeletionRequest', error);
      res.status(500).json({ error: 'Failed to submit deletion request' });
    }
  }
);
