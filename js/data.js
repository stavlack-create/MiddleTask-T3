/* ==========================================================
   data.js – all learning content in one place.
   Change texts here without touching the logic files.
   ========================================================== */

/* The three case states – traffic-light colors */
const STATES = {
  urgent: { label: 'דחוף', light: 'red', key: '1' },
  open: { label: 'פתוח', light: 'yellow', key: '2' },
  done: { label: 'הסתיים', light: 'green', key: '3' }
};

/* Chapter 1 – opening story, one step per time button */
const STORY_STEPS = [
  {
    time: '14:50',
    title: 'הבטחה ללקוחה',
    text: 'מיכל מבטיחה לגב\' לוי, בת 82 שגרה לבד, שטכנאי יגיע עד 17:00 לתקן את הטלפון בבית. זה הטלפון היחיד שלה.'
  },
  {
    time: '15:00',
    title: 'סוף המשמרת',
    text: 'מיכל רושמת פתק לעצמה והולכת הביתה. היא לא מעדכנת במערכת ולא מספרת לאבי, שבא אחריה.'
  },
  {
    time: '17:00',
    title: 'אף אחד לא מגיע',
    text: 'הטכנאי לא מגיע. אף אחד לא שלח אותו, כי אף אחד לא ידע.'
  },
  {
    time: '18:30',
    title: 'שיחה בבהלה',
    text: 'הבת של גב\' לוי מתקשרת למוקד: "אמא לא עונה כבר שעות, אמרו לנו שמישהו יבוא!" אבי פותח את המערכת ולא מוצא שום פנייה.'
  }
];

/* Chapter 2 – flip cards */
const STATE_CARDS = [
  { state: 'urgent', front: 'צריך לטפל בזה עכשיו, בשעה הקרובה.', example: 'ביקור בעוד שעה ועוד אין טכנאי.', todo: 'מספרים עליו למחליף ראשון.' },
  { state: 'open', front: 'עוד לא נגמר, אבל אפשר לחכות קצת.', example: 'קבענו ביקור למחר והלקוח עוד לא אישר.', todo: 'כותבים למחליף עד מתי לחזור ללקוח.' },
  { state: 'done', front: 'הטיפול נגמר. אין מה לעשות.', example: 'הטכנאי תיקן את הממיר והלקוח מרוצה.', todo: 'לא צריך להעביר למחליף.' }
];

/* Chapter 3 – the five M's of a good record */
const FIVE_M = [
  { word: 'מי', icon: 'i-user', question: 'מי הלקוח?', detail: 'שם, כתובת וטלפון.' },
  { word: 'מה', icon: 'i-wrench', question: 'מה התקלה?', detail: 'טלוויזיה, אינטרנט או טלפון, ומה בדיוק לא עובד.' },
  { word: 'מצב', icon: 'i-progress', question: 'מה כבר נעשה?', detail: 'מה ניסינו ואיפה עצרנו.' },
  { word: 'מתי', icon: 'i-clock', question: 'מתי זה קורה?', detail: 'שעת הביקור או המועד שמחכים לו.' },
  { word: 'משימה', icon: 'i-target', question: 'מה הצעד הבא?', detail: 'פעולה אחת למחליף, ועד מתי.' }
];

/* Chapter 4 – sorting cards (answer = correct state) */
const SORT_CARDS = [
  { id: 'c1', text: 'הטלוויזיה לא קלטה ערוצים. הטכנאי החליף ממיר והכול עובד.', answer: 'done', why: 'הטיפול נגמר והלקוח מרוצה.' },
  { id: 'c2', text: 'הצענו התקנת אינטרנט מהיר מחר ב-9:00. הלקוח עוד לא אישר.', answer: 'open', why: 'מחכים לאישור, אבל לא בשעה הקרובה.' },
  { id: 'c3', text: 'אין אינטרנט וטלפון בבית. ביקור ב-16:00 ועוד אין טכנאי.', answer: 'urgent', why: 'הביקור בעוד שעה ואין מי שיגיע.' },
  { id: 'c4', text: 'הלקוח ביטל את התקנת הטלוויזיה של היום.', answer: 'done', why: 'אין יותר מה לעשות בפנייה הזו.' },
  { id: 'c5', text: 'הלקוח ביקש שנחזור אליו ביום ראשון.', answer: 'open', why: 'צריך לחזור אליו, אבל רק ביום ראשון.' },
  { id: 'c6', text: 'הטכנאי יאחר בשעה, והלקוחה כבר מחכה בבית.', answer: 'urgent', why: 'הלקוחה מחכה עכשיו וצריך לעדכן אותה מיד.' }
];
