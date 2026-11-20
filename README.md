# מעבירים משמרת ושומרים על הרצף – גרסה סופית
לומדה למוקדנים חדשים במרכז התפעול "קישורים".
קורס תכנות 3 · מטלת אמצע · שלב 1 · קבוצה 28 · נוי וסתיו

## מבנה הקבצים
```
index.html          – העמוד (כל הפרקים)
css/style.css       – עיצוב, משתנים ב-:root, רספונסיביות, הדפסה
js/data.js          – כל התוכן (סיפור, מצבים, רשומה, כרטיסי מיון)
js/utils.js         – פונקציות משותפות: אייקונים, משוב, ולידציה
js/story.js         – פרק 1: ציר זמן אינטראקטיבי
js/states.js        – פרק 2: כרטיסים מתהפכים
js/record.js        – פרק 3: אריחי חמשת הממים
js/sort.js          – פרק 4: מיון בגרירה (עכבר ומגע) + מקשי 1/2/3
js/handover.js      – פרק 5: טופס העברת משמרת (ולידציה, בדיקה, הדפסה)
js/quiz.js          – פרק 6: מבחן מסכם + getFinalScore() לשלב ה-SCORM
assets/             – לוגו (SVG) ותמונות מוצר (assets/img)
```

## עמידה בדרישות המטלה
| דרישה | איפה |
|---|---|
| title עם שם האתר והעמוד | `<title>` ב-index.html |
| header: לוגו, ניווט, פתיח | `header.site-header` |
| nav עם aria-label | "ניווט ראשי" + "ניווט בתחתית העמוד" |
| footer | לוגו, קישורים לפרקים, קרדיטים, זכויות |
| metadata מלאות | description, keywords, author, theme-color, Open Graph |
| 3+ קטעי תוכן הדרכתי | סיפור (1), מצבי פניות (2), חמשת הממים (3) |
| 1+ תוכן אינטראקטיבי | ציר זמן, כרטיסים מתהפכים, מיון בגרירה |
| 2+ סוגי שאלות | חד-ברירה, רב-ברירה, התאמה, פתוחה |
| 2+ סוגי שדות | radio, checkbox, select, textarea (+ text/time בטופס ההעברה) |
| משוב במקרי קצה | חסרה תשובה, ולידציה (אורך טקסט מינימלי), נכון, חלקי, שגוי |
| Bootstrap | Bootstrap 5.3 RTL: navbar, grid, forms |
| CSS חיצוני עם משתנים | css/style.css |
| נגישות WCAG 2.1 | דילוג לתוכן, aria-live, aria-pressed, aria-invalid, fieldset/legend, label לכל שדה, חלופת מקלדת לגרירה, צבע+אייקון+טקסט, ניגודיות 4.5:1, prefers-reduced-motion |

**הערת נגישות לחוברת:** גרירה אינה נגישה למקלדת ולקוראי מסך. החלופה: עוברים לכרטיס עם Tab ומקישים 1 (דחוף), 2 (פתוח) או 3 (הסתיים). ההנחיה מוצגת מעל התרגיל ומוקראת לקורא המסך.

## קרדיטים וזכויות יוצרים
- Bootstrap 5.3.3 – רישיון MIT – https://getbootstrap.com
- פונט Rubik – Google Fonts – רישיון SIL Open Font License
- תמונות (assets/img: hero.jpg, story.jpg, devices.jpg) – נוצרו ב-Google Gemini (Flash), הפרומפטים למטה
- לוגו ואייקונים – SVG שנוצרו בעזרת Claude (Anthropic)
- "קישורים" הוא לקוח מדומה. השמות והפרטים בדיוניים.

## פרומפטים ב-Gemini (לנספח ה-AI)
1. **hero.jpg** – "Create an image: premium product photography of a sleek professional call-center headset with microphone, matte black and graphite finish, resting at an angle, deep navy blue (#060b2e) studio background, soft cyan and electric-blue rim light and a subtle glowing blue light streak behind it, cinematic, high-end telecom advertising style like Bezeq or yes Israel, object on the left side, large empty dark space on the right for text, wide 16:9, no people, no text, no logos."
2. **story.jpg** – "Create another image in exactly the same style, lighting and color palette: premium product photography of a modern white home landline phone with the handset lifted off its base and lying beside it, on a dark glossy surface, deep navy blue (#060b2e) background, soft cyan rim light, a small amber clock glow in the blurred background suggesting evening, moody and slightly tense, object on the left, empty dark space on the right, wide 16:9, no people, no text, no logos."
3. **devices.jpg** – "Create another image in exactly the same style, lighting and color palette: premium product photography of a sleek matte-black home Wi-Fi fiber router with tiny cyan status lights, a slim TV streaming box and a TV remote arranged together on a dark glossy surface, deep navy blue (#060b2e) background, soft cyan rim light and a subtle glowing blue light streak, high-end telecom advertising style, objects on the left, empty dark space on the right, wide 16:9, no people, no text, no logos."

## ציון ל-LMS (שלב 2)
`getFinalScore()` ב-js/quiz.js מחזירה ציון 0–100 (20 לכל שאלה נכונה, 10 לחלקית).
