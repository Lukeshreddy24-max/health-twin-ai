from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Spek(Base):
    __tablename__ = "speks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    tooltip_hint = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    simulations = relationship("HealthSimulation", back_populates="user")

class HealthSimulation(Base):
    __tablename__ = "health_simulations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    age = Column(Integer, nullable=False)
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    blood_pressure_systolic = Column(Integer, nullable=False)
    blood_pressure_diastolic = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    glucose = Column(Float, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    exercise_days = Column(Integer, nullable=False)
    smoker = Column(Boolean, default=False)
    alcohol_units = Column(Integer, default=0)
    water_intake = Column(Float, default=2.0)
    stress_level = Column(Integer, default=5)
    diet_type = Column(String(50), default="mixed")
    screen_time = Column(Float, default=4.0)
    steps_per_day = Column(Integer, default=5000)
    meditation_mins = Column(Integer, default=0)
    family_history = Column(String(255), default="none")
    supplements = Column(String(255), default="none")
    mood_score = Column(Integer, default=5)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    ai_analysis = Column(Text, nullable=False)
    future_timeline = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="simulations")
