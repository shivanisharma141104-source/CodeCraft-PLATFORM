/**
 * Localization Translations for Multi-language support
 */

export interface TranslationSet {
  // Navigation
  programmingCourses: string;
  codingPracticeSandbox: string;
  studyNotes: string;
  questionPapers: string;
  dashboard: string;
  signInSignUp: string;
  signOut: string;
  
  // Hero sections
  elevateProficiency: string;
  vettedClasses: string;
  heroSub: string;
  
  // Search and browse
  searchPlaceholder: string;
  difficultyLevel: string;
  categories: string;
  showingCourses: string;
  all: string;
  learnClass: string;
  resetFilters: string;
  noCoursesFound: string;
  noCoursesSub: string;
  
  // Features sections
  trendingCourses: string;
  trendingSub: string;
  recommendedForYou: string;
  recommendedSub: string;
  bookmarksAndFavorites: string;
  bookmarksSub: string;
  bookmarkEmpty: string;
  
  // Practice sandbox
  interactiveSandbox: string;
  sandboxSub: string;
  runCode: string;
  gradeCode: string;
  environment: string;
  reset: string;
  dailyChallengeTitle: string;
  practiceChallengeBtn: string;
  dailyChallengeHeroLabel: string;
  outputConsole: string;
  consoleGuide: string;
  
  // Notifications
  notifications: string;
  latestUpdate: string;
  noNotifications: string;
  
  // Student Dashboard
  welcomeBack: string;
  classroomPortalActive: string;
  studentDashboardSub: string;
  enrolledCourses: string;
  averageProgress: string;
  quizScorecards: string;
  savedHandouts: string;
  gradesTitle: string;
  obtainedGrade: string;
  quizRef: string;
  noEnrolledCourses: string;
  exploreCatalog: string;
  
  // AI assistant
  aiCompanion: string;
  aiCompanionActive: string;
  aiPlaceholder: string;
  aiGreeting: string;
  aiThinking: string;
  quickPrompts: string;
  suggestRecursion: string;
  suggestSqlJoin: string;
  suggestSpaceComplexity: string;
  challengesList: string;
  systemTaskConstraints: string;
  gradingCheckpoints: string;
  institutions: string;
}

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिंदी" }
];

export const TRANSLATIONS: { [lang: string]: TranslationSet } = {
  en: {
    programmingCourses: "Programming Courses",
    codingPracticeSandbox: "Coding Sandbox",
    studyNotes: "Study Notes & Syntax",
    questionPapers: "Question Papers",
    dashboard: "Dashboard",
    signInSignUp: "Sign In / Signup",
    signOut: "Sign Out",
    
    elevateProficiency: "Elevate Your Coding Proficiency",
    vettedClasses: "University-Vetted Classes",
    heroSub: "Learn from dynamic guides with structured modular syllabus lessons, secure interactive sandbox playgrounds, fast-feedback grading quizzes, and your own dedicated AI companion.",
    
    searchPlaceholder: "Search concepts or titles...",
    difficultyLevel: "Difficulty Level",
    categories: "Categories",
    showingCourses: "Showing {count} structured courses",
    all: "All",
    learnClass: "Learn Class",
    resetFilters: "Reset All Filters",
    noCoursesFound: "No Course Modules Found",
    noCoursesSub: "No active directories match your filter configurations. Switch categories or search for standard programming components.",
    
    trendingCourses: "🔥 Trending Courses",
    trendingSub: "Most enrolled classes inside our academy dynamic tracking logs.",
    recommendedForYou: "✨ Recommended for You",
    recommendedSub: "Custom curriculum recommendations matching your experience profile.",
    bookmarksAndFavorites: "⭐ Bookmarked Courses",
    bookmarksSub: "Your saved classes for rapid study-session revision.",
    bookmarkEmpty: "Bookmark courses to save them in this list for quick access.",
    
    interactiveSandbox: "Interactive IDE Sandbox",
    sandboxSub: "Evaluate code algorithms on secure sandboxed environments with live grading and feedback loops.",
    runCode: "Run Code",
    gradeCode: "Grade Code",
    environment: "Environment:",
    reset: "Reset",
    dailyChallengeTitle: "🔥 Daily Coding Challenges",
    practiceChallengeBtn: "Solve Challenge",
    dailyChallengeHeroLabel: "FEATURED DAILY CHALLENGE",
    outputConsole: "CodeCraft Output Console",
    consoleGuide: "Execute code blocks or click 'Grade Code' to review tests outcomes...",
    
    notifications: "Notifications",
    latestUpdate: "Latest Update:",
    noNotifications: "No new alerts.",
    
    welcomeBack: "Welcome back, {name}!",
    classroomPortalActive: "CLASSROOM PORTAL ACTIVE",
    studentDashboardSub: "Track curriculum completion milestones, open revision handouts, and resume your lectures seamlessly.",
    enrolledCourses: "Enrolled Courses",
    averageProgress: "Average Progress",
    quizScorecards: "Quiz Scorecards",
    savedHandouts: "Saved Handouts",
    gradesTitle: "Gradebook & Quiz Scorecard",
    obtainedGrade: "Obtained Grade",
    quizRef: "Quiz Ref",
    noEnrolledCourses: "You are not enrolled in any programming modules yet.",
    exploreCatalog: "Explore Course Catalogue",
    
    aiCompanion: "CodeCraft AI Companion",
    aiCompanionActive: "Gemini 3.5 Flash Active",
    aiPlaceholder: "Ask about pointers, recursion, SQL joins...",
    aiGreeting: "Hello! I am your CodeCraft AI assistant companion, powered by Gemini. How can I help you decode syntax, fix OOP bugs, or discuss question assignments today?",
    aiThinking: "AI companion is formulating answer parameters",
    quickPrompts: "Quick Suggestions",
    suggestRecursion: "Explain Recursion concepts",
    suggestSqlJoin: "How do SQL INNER JOINs perform?",
    suggestSpaceComplexity: "Tell me about Big-O Space complexity",
    challengesList: "Lecture Challenges",
    systemTaskConstraints: "SYSTEM TASK CONSTRAINTS",
    gradingCheckpoints: "Grading Checkpoints",
    institutions: "Institutions"
  },
  es: {
    programmingCourses: "Cursos de Programación",
    codingPracticeSandbox: "Patio de Pruebas",
    studyNotes: "Apuntes y Sintaxis",
    questionPapers: "Exámenes Anteriores",
    dashboard: "Panel",
    signInSignUp: "Iniciar Sesión / Registro",
    signOut: "Cerrar Sesión",
    
    elevateProficiency: "Eleva tu Competencia en Codificación",
    vettedClasses: "Clases Aprobadas por la Universidad",
    heroSub: "Aprende de guías dinámicas con lecciones de planes de estudio estructurados, entornos de ejecución interactivos seguros, cuestionarios de retroalimentación rápida y tu propio compañero de IA dedicado.",
    
    searchPlaceholder: "Buscar conceptos o títulos...",
    difficultyLevel: "Nivel de Dificultad",
    categories: "Categorías",
    showingCourses: "Mostrando {count} cursos estructurados",
    all: "Todos",
    learnClass: "Estudiar Clase",
    resetFilters: "Restablecer Filtros",
    noCoursesFound: "No se encontraron módulos",
    noCoursesSub: "No hay directorios activos que coincidan con su filtro. Cambie de categoría o busque componentes de programación estándar.",
    
    trendingCourses: "🔥 Cursos Destacados",
    trendingSub: "Las clases con más inscripciones registradas en nuestra academia.",
    recommendedForYou: "✨ Recomendado para Ti",
    recommendedSub: "Recomendaciones de currícula personalizadas según tu perfil de experiencia.",
    bookmarksAndFavorites: "⭐ Cursos Guardados",
    bookmarksSub: "Tus clases guardadas para una revisión rápida durante las sesiones de estudio.",
    bookmarkEmpty: "Guarda cursos como favoritos para verlos en esta lista para un acceso rápido.",
    
    interactiveSandbox: "Área de Pruebas IDE Interactiva",
    sandboxSub: "Evalas algoritmos de código en entornos sandbox seguros con pruebas y comentarios en vivo.",
    runCode: "Ejecutar",
    gradeCode: "Verificar Código",
    environment: "Entorno:",
    reset: "Reiniciar",
    dailyChallengeTitle: "🔥 Desafíos Diarios de Código",
    practiceChallengeBtn: "Resolver Desafío",
    dailyChallengeHeroLabel: "DESAFÍO DIARIO RECOMENDADO",
    outputConsole: "Consola de Salida CodeCraft",
    consoleGuide: "Ejecute bloques de código o haga clic en 'Verificar Código' para revisar los resultados de las pruebas...",
    
    notifications: "Notificaciones",
    latestUpdate: "Última Actualización:",
    noNotifications: "No hay alertas nuevas.",
    
    welcomeBack: "¡Bienvenido de nuevo, {name}!",
    classroomPortalActive: "PORTAL DE CLASES ACTIVO",
    studentDashboardSub: "Realice un seguimiento de los hitos de finalización del plan de estudios, abra folletos de revisión y reanude sus conferencias sin problemas.",
    enrolledCourses: "Cursos Inscritos",
    averageProgress: "Progreso Promedio",
    quizScorecards: "Cuestionarios Calificados",
    savedHandouts: "Materiales Guardados",
    gradesTitle: "Libro de Calificaciones",
    obtainedGrade: "Calificación Obtenida",
    quizRef: "Ref de Examen",
    noEnrolledCourses: "Aún no estás inscrito en ningún módulo de programación.",
    exploreCatalog: "Explorar catálogo",
    
    aiCompanion: "Compañero IA de CodeCraft",
    aiCompanionActive: "Gemini 3.5 Flash Activo",
    aiPlaceholder: "Preguntar sobre punteros, recursión, joins de SQL...",
    aiGreeting: "¡Hola! Soy tu asistente de IA de CodeCraft. ¿Cómo puedo ayudarte a entender la sintaxis, corregir errores de OOP o repasar tus lecciones hoy?",
    aiThinking: "El compañero de IA está formulando la respuesta",
    quickPrompts: "Sugerencias Rápidas",
    suggestRecursion: "Explicar la recursividad",
    suggestSqlJoin: "Cómo funcionan los joins en SQL",
    suggestSpaceComplexity: "Complejidad espacial en Big-O",
    challengesList: "Desafíos de la Clase",
    systemTaskConstraints: "RESTRICCIONES DEL SISTEMA",
    gradingCheckpoints: "Puntos de Control",
    institutions: "Instituciones"
  },
  de: {
    programmingCourses: "Reguläre Kurse",
    codingPracticeSandbox: "Programmier-Sandbox",
    studyNotes: "Notizen & Spickzettel",
    questionPapers: "Prüfungsfragen",
    dashboard: "Dashboard",
    signInSignUp: "Anmelden / Registrieren",
    signOut: "Abmelden",
    
    elevateProficiency: "Steigern Sie Ihre Programmierkenntnisse",
    vettedClasses: "Universitätsgeprüfte Lehrpläne",
    heroSub: "Lernen Sie aus dynamischen Anleitungen mit Lektionen, interaktiven Sandbox-Spielplatz-Umgebungen, Quizzes mit schnellem Feedback und Ihrem eigenen KI-Assistenten.",
    
    searchPlaceholder: "Nach Themen oder Titeln suchen...",
    difficultyLevel: "Schwierigkeitsgrad",
    categories: "Kategorien",
    showingCourses: "Zeigt {count} strukturierte Kurse",
    all: "Alle",
    learnClass: "Klasse Lernen",
    resetFilters: "Filter Zurücksetzen",
    noCoursesFound: "Keine Kurse gefunden",
    noCoursesSub: "Es entsprechen keine Kurse den ausgewählten Filtern. Bitte ändern Sie die Filteroptionen.",
    
    trendingCourses: "🔥 Angesagte Kurse",
    trendingSub: "Die am häufigsten belegten Kurse in unserer akademischen Lernplattform.",
    recommendedForYou: "✨ Empfehlungen für Sie",
    recommendedSub: "Personalisierte Kursempfehlungen basierend auf Ihrem Profil und Fortschritt.",
    bookmarksAndFavorites: "⭐ Favoriten & Lesezeichen",
    bookmarksSub: "Ihre gespeicherten Programmierkurse für die schnelle Wiederholung.",
    bookmarkEmpty: "Fügen Sie Kurse zu Ihren Lesezeichen hinzu, um sie hier für den schnellen Zugriff zu speichern.",
    
    interactiveSandbox: "Interaktive Programmierumgebung",
    sandboxSub: "Testen Sie Algorithmen in sicheren Sandbox-Umgebungen mit Live-Bewertungen.",
    runCode: "Ausführen",
    gradeCode: "Code Überprüfen",
    environment: "Umgebung:",
    reset: "Zurücksetzen",
    dailyChallengeTitle: "🔥 Tägliche Programmier-Aufgaben",
    practiceChallengeBtn: "Aufgabe Lösen",
    dailyChallengeHeroLabel: "HEUTIGE HERAUSFORDERUNG",
    outputConsole: "CodeCraft Ausgabe-Konsole",
    consoleGuide: "Führen Sie Codeblöcke aus oder klicken Sie auf 'Code Überprüfen', um die Testergebnisse zu sehen...",
    
    notifications: "Mitteilungen",
    latestUpdate: "Neues Update:",
    noNotifications: "Keine neuen Nachrichten vorhanden.",
    
    welcomeBack: "Willkommen zurück, {name}!",
    classroomPortalActive: "AKADEMISCHES PORTAL AKTIV",
    studentDashboardSub: "Verfolgen Sie Ihre Fortschritte, laden Sie Revisionsnotizen herunter und setzen Sie Vorlesungen nahtlos fort.",
    enrolledCourses: "Belegte Kurse",
    averageProgress: "Durchschnittlicher Fortschritt",
    quizScorecards: "Quiz-Ergebnisse",
    savedHandouts: "Gespeicherte Materialien",
    gradesTitle: "Notenbuch & Quizzes",
    obtainedGrade: "Erreichte Note",
    quizRef: "Quiz Ref",
    noEnrolledCourses: "Sie haben noch keine Programmierkurse belegt.",
    exploreCatalog: "Katalog erkunden",
    
    aiCompanion: "CodeCraft KI-Begleiter",
    aiCompanionActive: "Gemini 3.5 Flash Aktiv",
    aiPlaceholder: "Fragen Sie nach Zeigern, Rekursion oder SQL-Joins...",
    aiGreeting: "Hallo! Ich bin dein CodeCraft-KI-Begleiter. Wie kann ich dir heute dabei helfen, Programmiersprachen zu lernen, OOP-Probleme zu lösen oder Quizzes abzuschließen?",
    aiThinking: "Der KI-Assistent formuliert eine Antwort",
    quickPrompts: "Schnelle Vorschläge",
    suggestRecursion: "Erkläre Rekursion",
    suggestSqlJoin: "Wie funktionieren SQL-Joins?",
    suggestSpaceComplexity: "Was bedeutet Big-O Komplexität?",
    challengesList: "Kurs-Aufgaben",
    systemTaskConstraints: "SYSTEM-AUFGABEN-BESCHRÄNKUNGEN",
    gradingCheckpoints: "Bewertungs-Checkpunkte",
    institutions: "Institutionen"
  },
  hi: {
    programmingCourses: "प्रोग्रामिंग पाठ्यक्रम",
    codingPracticeSandbox: "कोडिंग सैंडबॉक्स",
    studyNotes: "अध्ययन नोट्स और सिंटैक्स",
    questionPapers: "प्रश्न पत्र",
    dashboard: "डैशबोर्ड",
    signInSignUp: "साइन इन / पंजीकरण",
    signOut: "साइन आउट",
    
    elevateProficiency: "अपनी कोडिंग दक्षता बढ़ाएं",
    vettedClasses: "विश्वविद्यालय-अनुमोदित कक्षाएं",
    heroSub: "संरचित मॉड्यूलर पाठ्यक्रम पाठों, सुरक्षित इंटरैक्टिव सैंडबॉक्स खेल के मैदानों, त्वरित-प्रतिक्रिया प्रश्नोत्तरी और अपने समर्पित एआई साथी के साथ गतिशील पाठ्यक्रमों से सीखें।",
    
    searchPlaceholder: "विषयों या शीर्षकों की खोज करें...",
    difficultyLevel: "कठिनाई का स्तर",
    categories: "श्रेणियाँ",
    showingCourses: "{count} संरचित पाठ्यक्रम दिखाए जा रहे हैं",
    all: "सभी",
    learnClass: "कक्षा सीखें",
    resetFilters: "फ़िल्टर रीसेट करें",
    noCoursesFound: "कोई भी पाठ्यक्रम नहीं मिला",
    noCoursesSub: "आपके फ़िल्टर से संबंधित कोई पाठ्यक्रम उपलब्ध नहीं हैं। कृपया अन्य श्रेणियों का चयन करें या बदलें।",
    
    trendingCourses: "🔥 लोकप्रिय पाठ्यक्रम",
    trendingSub: "अकादमी के ट्रैकिंग लॉग में सबसे अधिक नामांकित कक्षाएं।",
    recommendedForYou: "✨ आपके लिए अनुशंसित",
    recommendedSub: "आपके अनुभव प्रोफ़ाइल के अनुसार कस्टम पाठ्यक्रम अनुशंसाएँ।",
    bookmarksAndFavorites: "⭐ पसंदीदा पाठ्यक्रम",
    bookmarksSub: "त्वरित अध्ययन सत्र और पुनरीक्षण के लिए आपकी सहेजी गई कक्षाएं।",
    bookmarkEmpty: "त्वरित पहुँच के लिए इस सूची में सहेजने हेतु पाठ्यक्रमों को बुकमार्क करें।",
    
    interactiveSandbox: "इंटरैक्टिव आईडीई सैंडबॉक्स",
    sandboxSub: "लाइव ग्रेडिंग और फीडबैक लूप के साथ सुरक्षित सैंडबॉक्स वातावरण में कोड एल्गोरिदम का मूल्यांकन करें।",
    runCode: "कोड चलाएं",
    gradeCode: "कोड को सत्यापित करें",
    environment: "वातावरण:",
    reset: "रीसेट करें",
    dailyChallengeTitle: "🔥 दैनिक कोडिंग चुनौतियाँ",
    practiceChallengeBtn: "चुनौती हल करें",
    dailyChallengeHeroLabel: "विशेष दैनिक चुनौती",
    outputConsole: "कोडक्राफ्ट आउटपुट कंसोल",
    consoleGuide: "परीक्षण परिणामों की समीक्षा करने के लिए कोड ब्लॉक चलाएं या 'कोड को सत्यापित करें' पर क्लिक करें...",
    
    notifications: "सूचनाएं",
    latestUpdate: "नवीनतम अद्यतन:",
    noNotifications: "कोई नई सूचना नहीं है।",
    
    welcomeBack: "स्वागत है, {name}!",
    classroomPortalActive: "कक्षा पोर्टल सक्रिय है",
    studentDashboardSub: "पाठ्यक्रम पूरा होने के लक्ष्यों को ट्रैक करें, संशोधन पत्र खोलें, और आसानी से अपने व्याख्यान फिर से शुरू करें।",
    enrolledCourses: "नामांकित पाठ्यक्रम",
    averageProgress: "औसत प्रगति",
    quizScorecards: "प्रश्नोत्तरी स्कोरकार्ड",
    savedHandouts: "सहेजे गए नोट्स",
    gradesTitle: "ग्रेडबुक और प्रश्नोत्तरी स्कोरकार्ड",
    obtainedGrade: "प्राप्त ग्रेड",
    quizRef: "प्रश्नोत्तरी संदर्भ",
    noEnrolledCourses: "आप अभी तक किसी भी प्रोग्रामिंग मॉड्यूल में नामांकित नहीं हैं।",
    exploreCatalog: "कैटलॉग एक्सप्लोर करें",
    
    aiCompanion: "कोडक्राफ्ट एआई साथी",
    aiCompanionActive: "जेमिनी 3.5 फ्लैश सक्रिय",
    aiPlaceholder: "पॉइंटर, रिकर्सन, एसक्यूएल जॉइन के बारे में पूछें...",
    aiGreeting: "नमस्ते! मैं आपका कोडक्राफ्ट एआई सहायक साथी हूं। आज आपके कोडिंग सवालों, रिकर्सन या ओओपी (OOP) से संबंधित त्रुटियों को ठीक करने में मैं आपकी कैसे मदद कर सकता हूं?",
    aiThinking: "एआई साथी उत्तर तैयार कर रहा है",
    quickPrompts: "त्वरित सुझाव",
    suggestRecursion: "रिकर्सन की व्याख्या करें",
    suggestSqlJoin: "एसक्यूएल जॉइन्स कैसे काम करते हैं?",
    suggestSpaceComplexity: "बिग-ओ स्पेस जटिलता क्या है?",
    challengesList: "अध्याय चुनौतियाँ",
    systemTaskConstraints: "सिस्टम कार्य सीमाएं",
    gradingCheckpoints: "ग्रेडिंग चेकपॉइंट",
    institutions: "संस्थान"
  }
};
