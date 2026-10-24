CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.student_mentor_requests (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(20) NOT NULL,
  ip VARCHAR(64),
  input_len INTEGER,
  ok BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_mentor_ip_time ON t_p78828167_tutor_platform_1.student_mentor_requests (ip, created_at)