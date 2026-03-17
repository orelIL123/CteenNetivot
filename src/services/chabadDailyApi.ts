/**
 * לימוד יומי מאתר חב"ד — קישורים וכתובת האתר.
 * מביא את הנתונים דרך Cloud Function שמחלצת את המידע מהאתר של חב"ד.
 */

export const CHABAD_DAILY_LESSONS_URL = 'https://www.chabad.org.il/Lessons/Lessons.asp?CategoryID=175';

export interface DailyLessonItem {
  type: string;
  title: string;
  url: string;
}

/** קריאה ל-Cloud Function שמחזירה את שיעורי היום מחב"ד */
export async function fetchDailyLessonsFromApi(): Promise<DailyLessonItem[] | null> {
  const apiUrl = process.env.EXPO_PUBLIC_CHABAD_DAILY_API_URL || 'https://us-central1-cteennetivot-216e7.cloudfunctions.net/chabadDailyLessons';
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.lessons) ? data.lessons : null;
  } catch (e) {
    console.error('Failed fetching daily lessons', e);
    return null;
  }
}
