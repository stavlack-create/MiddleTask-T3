# מעבירים משמרת ושומרים על הרצף – גרסה סופית
לומדה למוקדנים חדשים במרכז התפעול "קישורים".
קורס תכנות 3 · מטלת אמצע · שלב 1 · קבוצה 28 · נוי וסתיו

## מבנה הלומדה
One Pager עם התקדמות אוטומטית: פותחים במענה לשיחה במסך הפתיחה, וכל פרק נפתח מתחת לקודם רק אחרי שהושלם (Progressive Disclosure). ההתקדמות נשמרת ב-localStorage.

1. **פתיחה** – מקום שמור לאנימציית סיפור המקרה + המסר "לא טעיתי בעבודה. רק שכחתי להעביר פרט אחד."
2. **מצבי הפניות** – שלושת המצבים (דחוף / פתוח / הסתיים) ו"פנייה שטופלה נכון" על ציר זמן.
3. **חמשת הממים** – השלמת רשומה + תרגול "איזה מ' חסר?".
4. **מיון פניות** – מיון בגרירה (עכבר ומגע) או במקשי 1/2/3, ניסיון אחד ומשוב בסוף.
5. **טופס העברה** – טופס העברת משמרת עם ולידציה, בדיקה ותצוגה של הדף שהמחליף מקבל.

**מצב עורך:** `#editor` בסוף הכתובת פותח את כל המסכים בלי נעילות; `#overview` מציג את כל המסכים כתמונות מוקטנות. במצב עורך יש תיבת הערות לכל מסך וכפתור "העתקת הערות".

## מבנה הקבצים
```
index.html          – העמוד (כל הפרקים)
css/style.css       – עיצוב, משתנים ב-:root, מצב כהה, רספונסיביות, הדפסה
vendor/             – Bootstrap 5.3 מקומי
js/data.js          – כל התוכן
js/utils.js         – פונקציות משותפות: אייקונים, משוב, ולידציה
js/progress.js      – מנגנון ההתקדמות, הניווט העליון ושמירה ב-localStorage
js/hero.js          – מסך הפתיחה (מענה לטלפון), מצב כהה, הופעה בגלילה
js/story.js         – פרק 1 (מקום שמור לאנימציה)
js/states.js        – פרק 2
js/record.js        – פרק 3
js/sort.js          – פרק 4
js/handover.js      – פרק 5
js/editor.js        – מצב עורך, תצוגת כל המסכים, הערות
js/quiz.js, js/scenarios.js – פרקי המבחן והסימולטור (הוסרו מהעמוד, הקוד נשמר)
assets/             – לוגו (SVG) ותמונות (assets/img)
```

## עמידה בדרישות המטלה
| דרישה | איפה |
|---|---|
| title עם שם האתר והעמוד | `<title>` ב-index.html |
| header: לוגו, ניווט, פתיח | תפריט עליון דביק + מסך פתיחה |
| nav עם aria-label | "התקדמות בלומדה" |
| footer | לוגו, קרדיטים, זכויות |
| metadata מלאות | description, author, theme-color, Open Graph |
| 3+ קטעי תוכן הדרכתי | פתיחה, מצבי פניות, חמשת הממים |
| 1+ תוכן אינטראקטיבי | מענה לטלפון, ציר זמן, השלמת רשומה, מיון בגרירה |
| סוגי שאלות | בחירה (איזה מ' חסר), מיון/התאמה, שאלות פתוחות בטופס |
| סוגי שדות | text, time בטופס ההעברה |
| משוב במקרי קצה | חסרה תשובה, ולידציה, נכון, חלקי, שגוי |
| Bootstrap | Bootstrap 5.3: grid ו-forms |
| CSS חיצוני עם משתנים | css/style.css |
| נגישות WCAG 2.1 | דילוג לתוכן, aria-live, aria-pressed, aria-current, label לכל שדה, חלופת מקלדת לגרירה, צבע+טקסט, prefers-reduced-motion |

**הערת נגישות לחוברת:** גרירה אינה נגישה למקלדת ולקוראי מסך. החלופה: עוברים לכרטיס עם Tab ומקישים 1 (דחוף), 2 (פתוח) או 3 (הסתיים).

## קרדיטים וזכויות יוצרים
- Bootstrap 5.3.3 – רישיון MIT – https://getbootstrap.com
- פונט Rubik – Google Fonts – רישיון SIL Open Font License
- תמונות (assets/img: hero.jpg, story.jpg, devices.jpg) – נוצרו ב-Google Gemini (Flash), הפרומפטים למטה
- לוגו ואייקונים – SVG שנוצרו בעזרת Claude (Anthropic)
- תמונת הדמות נועה (assets/img/noa.jpg) – סופקה על ידי הצוות
- "קישורים" הוא לקוח מדומה. השמות והפרטים בדיוניים.

## פרומפטים ב-Gemini (לנספח ה-AI)
1. **hero.jpg** – "Create an image: premium product photography of a sleek professional call-center headset with microphone, matte black and graphite finish, resting at an angle, deep navy blue (#060b2e) studio background, soft cyan and electric-blue rim light and a subtle glowing blue light streak behind it, cinematic, high-end telecom advertising style like Bezeq or yes Israel, object on the left side, large empty dark space on the right for text, wide 16:9, no people, no text, no logos."
2. **story.jpg** – "Create another image in exactly the same style, lighting and color palette: premium product photography of a modern white home landline phone with the handset lifted off its base and lying beside it, on a dark glossy surface, deep navy blue (#060b2e) background, soft cyan rim light, a small amber clock glow in the blurred background suggesting evening, moody and slightly tense, object on the left, empty dark space on the right, wide 16:9, no people, no text, no logos."
3. **devices.jpg** – "Create another image in exactly the same style, lighting and color palette: premium product photography of a sleek matte-black home Wi-Fi fiber router with tiny cyan status lights, a slim TV streaming box and a TV remote arranged together on a dark glossy surface, deep navy blue (#060b2e) background, soft cyan rim light and a subtle glowing blue light streak, high-end telecom advertising style, objects on the left, empty dark space on the right, wide 16:9, no people, no text, no logos."

## ציון ל-LMS (שלב 2)
המבחן המסכם הוסר מהעמוד בגרסה זו. `getFinalScore()` נשארה בקובץ js/quiz.js, אבל הקובץ לא נטען בעמוד.
