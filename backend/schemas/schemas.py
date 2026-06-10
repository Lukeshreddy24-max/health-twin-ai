from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpekBase(BaseModel):
    title: str
    content: str
    category: str
    tooltip_hint: Optional[str] = None

class SpekCreate(SpekBase):
    pass

class SpekUpdate(SpekBase):
    pass

class SpekResponse(SpekBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    class Config:
        from_attributes = True

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    token: str
    class Config:
        from_attributes = True

class SimulationInput(BaseModel):
    user_id: Optional[int] = None
    age: int
    height: float
    weight: float
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    heart_rate: int
    glucose: float
    sleep_hours: float
    exercise_days: int
    smoker: bool = False
    alcohol_units: int = 0
    water_intake: float = 2.0
    stress_level: int = 5
    diet_type: str = "mixed"
    screen_time: float = 4.0
    steps_per_day: int = 5000
    meditation_mins: int = 0
    family_history: str = "none"
    supplements: str = "none"
    mood_score: int = 5

class WhatIfInput(BaseModel):
    simulation_id: int
    scenario: str

class SimulationResponse(BaseModel):
    id: int
    age: int
    height: float
    weight: float
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    heart_rate: int
    glucose: float
    sleep_hours: float
    exercise_days: int
    smoker: bool
    alcohol_units: int
    water_intake: Optional[float] = 2.0
    stress_level: Optional[int] = 5
    diet_type: Optional[str] = "mixed"
    screen_time: Optional[float] = 4.0
    steps_per_day: Optional[int] = 5000
    meditation_mins: Optional[int] = 0
    family_history: Optional[str] = "none"
    supplements: Optional[str] = "none"
    mood_score: Optional[int] = 5
    risk_score: int
    risk_level: str
    ai_analysis: str
    future_timeline: str
    created_at: datetime
    class Config:
        from_attributes = True
