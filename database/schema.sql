-- Health Twin AI Simulator + Spekit Knowledge Base
-- Run this in psql: psql -U postgres -f schema.sql

CREATE DATABASE healthtwin;
\c healthtwin;

-- Spekit Knowledge Cards (Speks)
CREATE TABLE speks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tooltip_hint VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Simulation Results
CREATE TABLE health_simulations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    height FLOAT NOT NULL,
    weight FLOAT NOT NULL,
    blood_pressure_systolic INTEGER NOT NULL,
    blood_pressure_diastolic INTEGER NOT NULL,
    heart_rate INTEGER NOT NULL,
    glucose FLOAT NOT NULL,
    sleep_hours FLOAT NOT NULL,
    exercise_days INTEGER NOT NULL,
    smoker BOOLEAN DEFAULT FALSE,
    alcohol_units INTEGER DEFAULT 0,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    ai_analysis TEXT NOT NULL,
    future_timeline TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Speks
INSERT INTO speks (title, content, category, tooltip_hint) VALUES
('What is a Health Twin?', 'A Health Twin is a digital simulation of your body using your real health data — vitals, habits, and lifestyle — to predict future health risks using AI.', 'Getting Started', 'Your digital health copy'),
('How to create your Health Twin profile', 'Go to the Simulator page → Enter your age, height, weight → Fill in your vitals (BP, heart rate, glucose) → Add lifestyle habits → Click Analyze. Your AI twin is ready in seconds.', 'Getting Started', 'Start your twin here'),
('What does the Risk Score mean?', 'The Risk Score (0–100) is calculated by AI based on all your health inputs. 0–30 = Low Risk (green), 31–60 = Medium Risk (yellow), 61–100 = High Risk (red).', 'AI Predictions', 'Your health risk number'),
('How does the AI make predictions?', 'The AI analyzes your vitals against medical research data. It looks at combinations of factors — e.g. high BP + smoking + low exercise = significantly elevated cardiac risk — and generates a personalized timeline.', 'AI Predictions', 'How AI works for you'),
('How to log blood pressure', 'Use a standard BP monitor. Record systolic (top number) and diastolic (bottom number). Normal is 120/80. Enter both values in the Simulator form under Vitals section.', 'Vitals Tracking', 'Normal BP is 120/80'),
('What is a normal heart rate?', 'A healthy resting heart rate is 60–100 BPM. Athletes may have 40–60 BPM. Enter your resting heart rate (measured after sitting quietly for 5 minutes) in the Simulator.', 'Vitals Tracking', 'Normal: 60-100 BPM'),
('What is a normal glucose level?', 'Fasting glucose: 70–99 mg/dL is normal. 100–125 is prediabetes. 126+ is diabetes. Enter your most recent fasting glucose reading in the Simulator.', 'Vitals Tracking', 'Normal fasting: 70-99 mg/dL'),
('How is my data stored?', 'Your health data is stored securely in an encrypted PostgreSQL database. It is never shared with third parties. Only you can access your simulation history.', 'Privacy & Data', 'Your data is private'),
('Can I run a What-If simulation?', 'Yes! After your main analysis, scroll down to the What-If section. Type a scenario like "What if I exercise 30 mins daily?" and the AI will recalculate your risk score based on that change.', 'Simulator Features', 'Try different scenarios'),
('How to read my future timeline', 'The AI generates a year-by-year breakdown of potential health outcomes. Each age milestone (e.g. Age 40, 50, 60) shows predicted risks and recommended actions based on your current habits.', 'Simulator Features', 'See your health future'),
('Why is my heart highlighted red?', 'Red highlighting on the body map means HIGH RISK for that organ. For the heart, this typically means elevated blood pressure, high resting HR, or sedentary lifestyle. Check the AI recommendations panel.', 'Body Map', 'Red = high risk organ'),
('Data not updating in simulator', 'If your results seem outdated: 1) Clear browser cache 2) Re-enter your vitals 3) Click Analyze again. Each simulation is a fresh AI analysis. Previous results are saved in History.', 'Troubleshooting', NULL);
