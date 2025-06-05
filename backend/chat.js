import { handleChat } from './backend.chat.js';

export const scenarios = {
  he: [
    {
      id: 1,
      text: `*תרחיש 1*
חוק המואזין
בבוקר השיעור אישרה הכנסת, בקריאה ראשונה, הצעת החוק הקוראת על איסור השמעת מואזין
(מבוסס על הצעת חוק אמיתית). בפתח השיעור, התקיים דיון בנושא, כאשר חלק מהסטודנטים
הביעו עמדות נחרצות בעד הצעד, מה שעורר תחושות תסכול אצל הסטודנטים המוסלמים. אלה אף נפגעו מעצם קיום הדיון בכיתה.
כיצד לדעתך המרצה צריך לנהוג בשיעורים הבאים?
האם עליו לוותר על העיסוק בסוגיה בשל המתיחות? במידה ולא, כיצד היית נוהג.ת?`
    },
    {
      id: 2,
      text: `*תרחיש 2*
סטריאוטיפ המוחלש
בפקולטה ברפואה, הסטודנטים נדרשים לאבחן ולהציע טיפול למטופלים. אחת המתרגלות כתבה
משימה ובה מקרה בוחן לניתוח עבור הסטודנטים. המקרה מתאר מטופל אתיופי שסובל מאיידס.
סטודנטים אתיופים שקראו את הדוגמה לא הגישו את המשימה, ונקטו בשביתה איטלקית בקורס
ועברו אותו בקושי. מנגד, המרצה שלא שמה לב לדוגמה ולתסכול של הסטודנטים, האשימה שהם חסרי מוטיבציה בקורס.
מה לדעתך אפשר לעשות כדי להימנע ממקרים כאלה בעתיד?`
    },
    {
      id: 3,
      text: `*תרחיש 3*
יחסי צוות עכורים במעבדה
ד"ר לוי מנהלת מעבדת מחקר בכימיה הכוללת שמונה סטודנטים לתואר שני, חצי יהודים וחצי ערבים. בעקבות המתיחות הביטחונית, היחסים בין הקבוצות הדרדרו. סטודנטים שהיו עד לא מכבר ביחסים טובים, הפסיקו לברך זה את זה לשלום והיחסים הצטמצמו להיבטים קורקטיים של העבודה בלבד. ד"ר לוי מרגישה שהיחסים העכורים גם משליכים לרעה על העבודה, משום שבישיבות הצוות הסטודנטים הפסיקו לשתף לעומק, לבקר רעיונות ולהציע רעיונות חדשים.
כיצד לדעתך ד"ר לוי צריכה לנהוג?`
    },
    {
      id: 4,
      text: `*תרחיש 4*
הערות פוגעניות כלפי להט"בים
בשיעור על פילוסופיה קלאסית במדעי המדינה, הסטודנטים נחשפים לטקסט של אפלטון. אחד הסטודנטים מעיר שסוקרטס תיאר את אפלטון כמי שנמשך לנערים. בתגובה אחד הסטודנטים מעיר "זו סטייה וזה אסור בדת". המרצה לא יודע מה לעשות והוא ממשיך בשיעור מבלי להתייחס לתגובה של הסטודנט. לאחר השיעור, סטודנטית אחרת, שנפגעה מההערה של הסטודנט, כותבת אימייל לראש החוג, בו היא מאשימה את המרצה בחוסר תגובה לגזענות בשיעור ואומרת שהיא לא רוצה להשתתף יותר בשיעור.
איך לדעתך המרצה צריך לנהוג?`
    }
  ],
  en: [
    {
      id: 1,
      text: `*Scenario 1*
The Muezzin Law
On the morning of class, the Knesset approved in a preliminary vote a bill to ban the call of the muezzin (based on a real proposal). At the start of class there was a discussion. Some students strongly supported the step, causing frustration among the Muslim students, who were hurt by the very discussion.
How should the lecturer act in the coming lessons?
Should the topic be avoided because of the tension? If not, what would you do?`
    },
    {
      id: 2,
      text: `*Scenario 2*
The Weakened Stereotype
In the medical faculty, students must diagnose and propose treatment for patients. One teaching assistant wrote an assignment with a case study describing an Ethiopian patient with AIDS.
Ethiopian students who read the example did not submit the assignment and staged a slowdown strike in the course, barely passing. The lecturer, unaware of the example or the students' frustration, accused them of lacking motivation.
What can be done to avoid such incidents in the future?`
    },
    {
      id: 3,
      text: `*Scenario 3*
Tense Relations in the Lab
Dr. Levy runs a chemistry lab with eight master's students, half Jewish and half Arab. Following security tensions, relations between the groups deteriorated. Students who were previously on good terms stopped greeting each other and interactions became strictly professional. Dr. Levy feels the tense relations harm the work because in team meetings students no longer share deeply, critique ideas or suggest new ones.
How should Dr. Levy act?`
    },
    {
      id: 4,
      text: `*Scenario 4*
Offensive Remarks Toward LGBTQ Students
In a classical philosophy class in political science, students read a text by Plato. One student notes that Socrates described Plato as attracted to boys. Another student responds, "That's deviant and forbidden by religion." The lecturer doesn't know what to do and continues without addressing the comment. After class another student, hurt by the remark, emails the department head accusing the lecturer of ignoring discrimination and saying she no longer wants to participate.
How should the lecturer act?`
    }
  ],
  ar: [
    {
      id: 1,
      text: `*السيناريو 1*
قانون المؤذن
في صباح الدرس صادقت الكنيست في قراءة تمهيدية على اقتراح قانون يمنع رفع الأذان (مبني على اقتراح حقيقي). في بداية الدرس دار نقاش، حيث أيد بعض الطلاب الخطوة بشدة مما أثار شعوراً بالإحباط لدى الطلاب المسلمين، بل وشعروا بالإساءة من مجرد طرح الموضوع في الصف.
برأيك كيف ينبغي للمحاضر أن يتصرف في الدروس القادمة؟
هل عليه التنازل عن تناول الموضوع بسبب التوتر؟ وإن لم يكن، كيف كنت ستتصرف/ين؟`
    },
    {
      id: 2,
      text: `*السيناريو 2*
القولبة المضعّفة
في كلية الطب يُطلب من الطلاب تشخيص المرضى واقتراح العلاج. كتبت إحدى المساعدات مهمة فيها دراسة حالة لِمريض إثيوبي مصاب بالإيدز.
الطلاب الإثيوبيون الذين قرأوا المثال لم يسلّموا المهمة وأضربوا ببطء في المساق ونجحوا بصعوبة. بالمقابل، لم تلاحظ المحاضِرة المثال ولا إحباط الطلاب واتهمتهم بقلة الدافعية في المساق.
ما الذي يمكن فعله لتجنّب حالات كهذه مستقبلاً؟`
    },
    {
      id: 3,
      text: `*السيناريو 3*
علاقات متوترة في المختبر
تدير د. ليفي مختبر كيمياء يضم ثمانية طلاب ماجستير، نصفهم يهود ونصفهم عرب. نتيجة للتوتر الأمني تدهورت العلاقات بين المجموعتين. الطلاب الذين كانوا على علاقة طيبة توقفوا عن تبادل التحية واقتصرت العلاقة على الجانب المهني فقط. تشعر د. ليفي أن هذه الأجواء السلبية تؤثر سلباً على العمل لأن الطلاب في الاجتماعات توقفوا عن المشاركة العميقة ونقد الأفكار واقتراح أفكار جديدة.
كيف برأيك يجب أن تتصرف د. ليفي؟`
    },
    {
      id: 4,
      text: `*السيناريو 4*
تعليقات مسيئة للمثليين
في درس الفلسفة الكلاسيكية في العلوم السياسية، يقرأ الطلاب نصاً لأفلاطون. يعلق أحد الطلاب بأن سقراط وصف أفلاطون كمَن ينجذب إلى الفتيان. فيرد طالب آخر قائلاً: "هذا انحراف ومحرَّم في الدين". لا يعرف المحاضر كيف يتصرف ويواصل الدرس دون التطرق للتعليق. بعد الدرس، تكتب طالبة أُخرى شعرت بالإساءة بريداً لرئيس القسم تتهم فيه المحاضر بعدم الرد على العنصرية وتقول إنها لا تريد مواصلة المشاركة في الدرس.
كيف يجب أن يتصرف المحاضر؟`
    }
  ]
};

export { handleChat };
