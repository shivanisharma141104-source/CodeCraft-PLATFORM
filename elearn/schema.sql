-- ========================================================
-- CODECRAFT PLATFORM - RELATIONAL DATABASE SCHEMA (MySQL)
-- ========================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS codecraft_db;
USE codecraft_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed passwords storage
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
  approved BOOLEAN NOT NULL DEFAULT TRUE, -- Pending true for instructors review state
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
  thumbnail VARCHAR(255) NOT NULL,
  instructor_id VARCHAR(50) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  order_index INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Video Lessons Table
CREATE TABLE IF NOT EXISTS video_lessons (
  id VARCHAR(50) PRIMARY KEY,
  module_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  video_url VARCHAR(255) NOT NULL, -- YouTube Link
  youtube_id VARCHAR(11) NOT NULL,  -- Extracted Video ID
  order_index INT NOT NULL,
  duration VARCHAR(30) NOT NULL DEFAULT '10 mins',
  notes_name VARCHAR(100) DEFAULT NULL,
  notes_url VARCHAR(255) DEFAULT NULL,
  source_code TEXT DEFAULT NULL,    -- Source snippet block
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 10,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(50) PRIMARY KEY,
  quiz_id VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  options JSON NOT NULL,            -- Array of options options
  correct_answer_index INT NOT NULL,-- Index from 0 to 3
  explanation TEXT NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Study Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,            -- Markdown syntax references
  file_url VARCHAR(255) DEFAULT NULL,
  file_name VARCHAR(100) DEFAULT NULL,
  file_type ENUM('pdf', 'ppt', 'doc', 'code') NOT NULL DEFAULT 'pdf',
  downloads_count INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Historical Question Papers Table
CREATE TABLE IF NOT EXISTS question_papers (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  exam_type ENUM('Previous Year', 'Model Paper', 'MCQ Bank') NOT NULL,
  file_url VARCHAR(255) NOT NULL,   -- Attachment target downloads
  content TEXT NOT NULL,            -- Markdown revision keys
  answer_keys JSON NOT NULL         -- Answer key references
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Progress Tracking Table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  completed_lesson_ids JSON DEFAULT NULL,   -- Completed lesson id list
  quiz_attempts JSON DEFAULT NULL,          -- Score mappings
  last_watched_id VARCHAR(50) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(50) PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(30) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES video_lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- INSERTS / SEEDS INDEXES (Optional references)
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_course_category ON courses(category);
CREATE INDEX idx_lesson_module ON video_lessons(module_id);
