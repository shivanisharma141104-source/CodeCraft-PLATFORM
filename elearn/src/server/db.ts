import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { 
  User, UserRole, Course, CourseModule, VideoLesson, 
  Quiz, QuizQuestion, StudyNote, QuestionPaper, 
  ProgressTracking, Comment, CodingExercise, Notification, DailyChallenge, RegisteredInstitution
} from "../types.js"; // Note: Use ts or js based on Node config. We import relatively.

const DB_FILE = path.join(process.cwd(), "database.json");

interface DatabaseSchema {
  users: User[];
  passwords: { [userId: string]: string }; // Private hashed passwords mapping
  courses: Course[];
  modules: CourseModule[];
  lessons: VideoLesson[];
  quizzes: Quiz[];
  questions: QuizQuestion[];
  notes: StudyNote[];
  papers: QuestionPaper[];
  progress: ProgressTracking[];
  comments: Comment[];
  challenges: DailyChallenge[];
  institutions?: RegisteredInstitution[];
}

// Function to extract youtube video ID
export function getYoutubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

// Global cached connection
let cachedDb: DatabaseSchema | null = null;

export function loadDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  let needsSave = false;
  const seed = getSeedData();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      cachedDb = JSON.parse(content);
      
      const keys: (keyof DatabaseSchema)[] = [
        "users", "passwords", "courses", "modules", "lessons", 
        "quizzes", "questions", "notes", "papers", "progress", 
        "comments", "challenges", "institutions"
      ];
      
      for (const k of keys) {
        if (!cachedDb![k]) {
          (cachedDb as any)[k] = seed[k] || [];
          needsSave = true;
        } else if (Array.isArray(cachedDb![k]) && (cachedDb![k] as any).length === 0 && Array.isArray(seed[k]) && (seed[k] as any).length > 0) {
          // If a table is empty but has seed collections, heal it so platform is active
          (cachedDb as any)[k] = seed[k];
          needsSave = true;
        }
      }
      
      if (needsSave) {
        saveDb(cachedDb!);
      }
      
      return cachedDb!;
    } catch (e) {
      console.error("Failed to read database.json, initializing fresh db...", e);
    }
  }

  // If no DB exists, populate seed data with rich learning materials!
  cachedDb = seed;
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(db: DatabaseSchema): void {
  cachedDb = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.warn("Could not write to local database.json storage. Falling back to robust in-memory caching:", error);
  }
}

function getSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  
  const users: User[] = [
    {
      id: "u-admin",
      email: "admin@codecraft.com",
      name: "Admin Principal",
      role: UserRole.ADMIN,
      approved: true,
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-inst1",
      email: "dr_alan@codecraft.com",
      name: "Dr. Alan Turing",
      role: UserRole.INSTRUCTOR,
      approved: true,
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alan",
      createdAt: new Date().toISOString(),
      isAcademicAffiliated: true,
      institutionId: "inst-2",
      institutionName: "Massachusetts Institute of Technology (MIT)"
    },
    {
      id: "u-inst2",
      email: "grace@codecraft.com",
      name: "Grace Hopper",
      role: UserRole.INSTRUCTOR,
      approved: false, // Needs Admin approval
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=grace",
      createdAt: new Date().toISOString()
    },
    {
      id: "u-stud1",
      email: "student@codecraft.com",
      name: "John Doe",
      role: UserRole.STUDENT,
      approved: true,
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=john",
      createdAt: new Date().toISOString(),
      isAcademicAffiliated: true,
      institutionId: "inst-2",
      institutionName: "Massachusetts Institute of Technology (MIT)"
    }
  ];

  const passwords: { [id: string]: string } = {
    "u-admin": bcrypt.hashSync("admin123", salt),
    "u-inst1": bcrypt.hashSync("instructor123", salt),
    "u-inst2": bcrypt.hashSync("instructor123", salt),
    "u-stud1": bcrypt.hashSync("student123", salt)
  };

  const courses: Course[] = [
    {
      id: "c-python",
      title: "Python Masterclass: From Beginner to Pro",
      description: "Dive deep into modern Python programming. Master variables, lists, OOP, APIs, and data science concepts with hands-on coding exercises.",
      category: "Python",
      duration: "10 hours",
      difficulty: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
      instructorId: "u-inst1",
      authorName: "Dr. Alan Turing",
      createdAt: new Date().toISOString()
    },
    {
      id: "c-java",
      title: "Java Foundations: OOP & Data Structures",
      description: "Understand compilation, JVM, typed lists, interfaces, concurrency, and algorithms using core Java. Essential for university examinations.",
      category: "Java",
      duration: "15 hours",
      difficulty: "Intermediate",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
      instructorId: "u-inst1",
      authorName: "Dr. Alan Turing",
      createdAt: new Date().toISOString()
    },
    {
      id: "c-js",
      title: "Javascript Essentials for Web Apps",
      description: "Unlock high-performance client-side Javascript. Master ES6+, closures, Async/Await, Fetch API, and asynchronous events.",
      category: "JavaScript",
      duration: "8 hours",
      difficulty: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=60",
      instructorId: "u-inst1",
      authorName: "Dr. Alan Turing",
      createdAt: new Date().toISOString()
    },
    {
      id: "c-react",
      title: "React.js: Complete Single Page App Guide",
      description: "Build robust, blazing-fast web architectures. Learn JSX, State, Hooks, Context API, Tailwind integration, and responsive layout designs.",
      category: "React.js",
      duration: "12 hours",
      difficulty: "Intermediate",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60",
      instructorId: "u-inst1",
      authorName: "Dr. Alan Turing",
      createdAt: new Date().toISOString()
    }
  ];

  const modules: CourseModule[] = [
    { id: "m-py-1", courseId: "c-python", title: "Variables & Standard I/O", orderIndex: 1 },
    { id: "m-py-2", courseId: "c-python", title: "Data Structures & Control Flows", orderIndex: 2 },
    { id: "m-py-3", courseId: "c-python", title: "Object Oriented Programming (OOP)", orderIndex: 3 },
    
    { id: "m-jv-1", courseId: "c-java", title: "Java Intro & JVM Architecture", orderIndex: 1 },
    { id: "m-jv-2", courseId: "c-java", title: "Classes, Objects & Inheritance", orderIndex: 2 },
    
    { id: "m-js-1", courseId: "c-js", title: "ES6 Syntax & Array Iterators", orderIndex: 1 },
    { id: "m-js-2", courseId: "c-js", title: "Promises & Async/Await Pattern", orderIndex: 2 }
  ];

  const lessons: VideoLesson[] = [
    // Python Module 1
    {
      id: "l-py-1",
      moduleId: "m-py-1",
      courseId: "c-python",
      title: "Setting Up Python & Variables",
      videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
      youtubeId: "kqtD5dpn9C8",
      orderIndex: 1,
      duration: "10 mins",
      notesName: "Python_Installation_Guide.pdf",
      notesUrl: "/api/downloads/python_setup.pdf",
      sourceCode: `print("Welcome to Python!")\nusername = "Ciel"\nprint("Hello,", username)`,
      sourceCodeUrl: "/api/downloads/py-v1.py"
    },
    {
      id: "l-py-2",
      moduleId: "m-py-1",
      courseId: "c-python",
      title: "Input Functions & Typings",
      videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
      youtubeId: "kqtD5dpn9C8",
      orderIndex: 2,
      duration: "15 mins",
      notesName: "Console_IO.doc",
      notesUrl: "/api/downloads/py_io.doc",
      sourceCode: `name = input("Enter name: ")\nprint("Greetings", name)`
    },
    // Python Module 2
    {
      id: "l-py-3",
      moduleId: "m-py-2",
      courseId: "c-python",
      title: "Python Lists & Comprehensions",
      videoUrl: "https://www.youtube.com/watch?v=9OeznAkyQz4",
      youtubeId: "9OeznAkyQz4",
      orderIndex: 1,
      duration: "18 mins",
      notesName: "Lists_CheatSheet.pdf",
      notesUrl: "/api/downloads/py_lists.pdf",
      sourceCode: `# Dynamic lists\nnumbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint("Squares:", squares)`
    },
    // Java Module 1
    {
      id: "l-jv-1",
      moduleId: "m-jv-1",
      courseId: "c-java",
      title: "Understanding JDK, JRE, & JVM",
      videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34",
      youtubeId: "eIrMbAQSU34",
      orderIndex: 1,
      duration: "20 mins",
      notesName: "Java_Architecture.pdf",
      notesUrl: "/api/downloads/java_jvm.pdf",
      sourceCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from JVM!");\n    }\n}`
    },
    // Javascript Module 1
    {
      id: "l-js-1",
      moduleId: "m-js-1",
      courseId: "c-js",
      title: "Arrow Functions & Let/Const Scope",
      videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
      youtubeId: "W6NZfCO5SIk",
      orderIndex: 1,
      duration: "12 mins",
      notesName: "ES6_Scope_Variables.ppt",
      notesUrl: "/api/downloads/es6_scope.ppt",
      sourceCode: `const greet = (name) => \`Hi \${name}!\`;\nconsole.log(greet("Developer"));`
    },
    {
      id: "l-js-2",
      moduleId: "m-js-2",
      courseId: "c-js",
      title: "Understanding Promises & Microtasks",
      videoUrl: "https://www.youtube.com/watch?v=vV_Wb0bS8_g",
      youtubeId: "vV_Wb0bS8_g",
      orderIndex: 1,
      duration: "25 mins",
      notesName: "Promises_Handout.pdf",
      notesUrl: "/api/downloads/js_promises.pdf",
      sourceCode: `const delay = (ms) => new Promise(res => setTimeout(res, ms));\ndelay(1000).then(() => console.log("Promise Resolved!"));`
    }
  ];

  const quizzes: Quiz[] = [
    { id: "q-py-1", courseId: "c-python", title: "Variables & Input Quiz", durationMinutes: 10 },
    { id: "q-js-1", courseId: "c-js", title: "Arrow Functions Quiz", durationMinutes: 5 }
  ];

  const questions: QuizQuestion[] = [
    {
      id: "qq-py-1",
      quizId: "q-py-1",
      questionText: "Which statement is true to output 'Hello' in Python?",
      options: [
        "console.log('Hello')",
        "print('Hello')",
        "System.out.println('Hello')",
        "cout << 'Hello';"
      ],
      correctAnswerIndex: 1,
      explanation: "Python uses the print() function to write output directly to the standard output terminal."
    },
    {
      id: "qq-py-2",
      quizId: "q-py-1",
      questionText: "How do you declare a variable called 'x' with the integer value 5 in Python?",
      options: [
        "int x = 5",
        "var x = 5",
        "x = 5",
        "let x: 5"
      ],
      correctAnswerIndex: 2,
      explanation: "Python is dynamically typed; variable initialization requires no keywords or type declarations."
    },
    {
      id: "qq-js-1",
      quizId: "q-js-1",
      questionText: "What is the primary difference between 'let' and 'var' declarations in JS?",
      options: [
        "'let' is block-scoped, while 'var' is function-scoped",
        "'var' cannot be updated",
        "'let' is pushed to the global window always",
        "There is no difference"
      ],
      correctAnswerIndex: 0,
      explanation: "Variables declared with 'let' are block-scoped. 'var' variables do not respect block bounds and are function-scoped."
    }
  ];

  const notes: StudyNote[] = [
    {
      id: "n-py",
      title: "Python OOP and Magic Methods Cheat Sheet",
      category: "Python",
      content: `# Python Object-Oriented Syntax\n\n\`\`\`python\nclass CodingPlatform:\n    def __init__(self, name):\n        self.name = name\n        \n    def __str__(self):\n        return f"Platform: {self.name}"\n\`\`\`\n\n### Magic Methods\n- \`__init__\`: Constructor called upon object instanciation.\n- \`__str__\`: Returns standard printable string representation.\n- \`__repr__\`: Rich developer-facing inspection expression.\n- \`__len__\`: Overrides the \`len()\` global call.`,
      downloadsCount: 145,
      fileName: "Python_OOP_Cheatsheet.pdf",
      fileUrl: "/api/downloads/py_oop.pdf",
      fileType: "pdf"
    },
    {
      id: "n-js",
      title: "JavaScript ES6+ Array Iterators Guide",
      category: "JavaScript",
      content: `# JS Array Iterators Map, Filter & Reduce\n\nUse declarative programming styles:\n\n\`\`\`javascript\nconst items = [12, 45, 78, 90];\n// Map\nconst doubleValues = items.map(x => x * 2);\n// Filter\nconst filtered = items.filter(x => x > 50);\n// Reduce\nconst summation = items.reduce((acc, curr) => acc + curr, 0);\n\`\`\`\n\n### Key Concepts\n- **Immutable output**: Functions generate new instances rather than mutating initial state.\n- **Callback functions**: Lambda triggers inside array evaluation loop.`,
      downloadsCount: 228,
      fileName: "JS_Iterator_Map_Filter.pdf",
      fileUrl: "/api/downloads/js_map_filter.pdf",
      fileType: "pdf"
    }
  ];

  const papers: QuestionPaper[] = [
    {
      id: "qp-py",
      title: "2025 Python Advanced Final Term Examination Paper",
      category: "Python",
      year: 2025,
      examType: "Previous Year",
      fileUrl: "/api/downloads/qp_py_2025.pdf",
      content: `### Examination Overview: Core Problems & Solutions\n\n**Q1: Implement a custom decorator @timer to measure runtime of any execution.**\n\n*Code Solution:*\n\`\`\`python\nimport time\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"Elapsed: {time.time() - start}s")\n        return result\n    return wrapper\n\`\`\`\n\n**Q2: What are python generator functions? Include yield implementation.**\n\n*Explanation:*\nGenerator functions return iterator objects using \`yield\` dynamically, saving memory allocation over bulky in-memory lists.`,
      answerKeys: {
        "Q1": "Code implementation for standard decorators using nested wrapper methods.",
        "Q2": "Generators lazy load iterations step-by-step; they maintain local state index safely during yielding."
      }
    },
    {
      id: "qp-ds",
      title: "Data Structures & Algorithms MCQ Question Bank",
      category: "Data Structures & Algorithms",
      year: 2024,
      examType: "MCQ Bank",
      fileUrl: "/api/downloads/qp_dsa.pdf",
      content: `### Data Structures High-Contrast Bank\n\n**Q1: Which complexity dictates Binary Search binary iterations in sorted bounds?**\n- A) O(N)\n- B) O(log N) [Correct]\n- C) O(N log N)\n- D) O(1)\n\n**Q2: What data structure maintains Last In First Out (LIFO) storage order?**\n- A) Queue\n- B) Heap\n- C) Stack [Correct]\n- D) Tri-tree`,
      answerKeys: {
        "Q1": "B",
        "Q2": "C"
      }
    }
  ];

  const progress: ProgressTracking[] = [];
  const comments: Comment[] = [
    {
      id: "c1",
      lessonId: "l-py-1",
      userId: "u-stud1",
      userName: "John Doe",
      userRole: UserRole.STUDENT,
      text: "This explanation is brilliant! Simple set up instructions made coding easily. Thanks",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  const challenges: DailyChallenge[] = [
    {
      id: "chal-1",
      title: "Two Sum Problem",
      description: "Write a function that returns the indices of two numbers in an array that add up to a specific target.",
      problem: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      category: "Data Structures & Algorithms",
      startingCode: "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}",
      solutionCode: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      testCases: [
        { input: "[[2, 7, 11, 15], 9]", expectedOutput: "[0, 1]" },
        { input: "[[3, 2, 4], 6]", expectedOutput: "[1, 2]" }
      ],
      date: new Date().toISOString().split("T")[0]
    }
  ];

  const institutions: RegisteredInstitution[] = [
    {
      id: "inst-1",
      name: "Model Academy Secondary School",
      type: "school",
      category: "academic",
      location: "Jammu, India",
      website: "https://www.modelacademy.in",
      contactEmail: "info@modelacademy.in",
      contactPhone: "+91-191-2543322",
      enrollmentSize: 1200,
      description: "A prestigious junior school known for its early computer science foundational training and programming workshops.",
      createdAt: new Date().toISOString(),
      status: "approved"
    },
    {
      id: "inst-2",
      name: "Massachusetts Institute of Technology (MIT)",
      type: "university",
      category: "academic",
      location: "Boston, USA",
      website: "https://www.mit.edu",
      contactEmail: "admissions@mit.edu",
      contactPhone: "+1-617-253-1000",
      enrollmentSize: 11000,
      description: "A world-renowned research university pioneering in advanced algorithms, artificial intelligence, and software paradigms.",
      createdAt: new Date().toISOString(),
      status: "approved"
    },
    {
      id: "inst-3",
      name: "Indian Institute of Technology (IIT Delhi)",
      type: "college",
      category: "academic",
      location: "New Delhi, India",
      website: "https://home.iitd.ac.in",
      contactEmail: "registrar@iitd.ac.in",
      contactPhone: "+91-11-2659-1000",
      enrollmentSize: 8500,
      description: "Top-tier engineering university fostering world-class academic research in computer science theory and OOP structures.",
      createdAt: new Date().toISOString(),
      status: "approved"
    }
  ];

  return {
    users,
    passwords,
    courses,
    modules,
    lessons,
    quizzes,
    questions,
    notes,
    papers,
    progress,
    comments,
    challenges,
    institutions
  };
}
