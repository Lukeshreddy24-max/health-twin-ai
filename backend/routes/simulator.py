from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from core.database import get_db
from models.models import HealthSimulation, User
from schemas.schemas import SimulationInput, SimulationResponse, WhatIfInput, UserCreate, UserResponse

router = APIRouter(prefix="/api", tags=["simulator"])

def calculate_risk_score(data: SimulationInput) -> int:
    score = 0
    if data.blood_pressure_systolic > 140 or data.blood_pressure_diastolic > 90:
        score += 25
    elif data.blood_pressure_systolic > 120 or data.blood_pressure_diastolic > 80:
        score += 12
    if data.heart_rate > 100 or data.heart_rate < 50:
        score += 15
    elif data.heart_rate > 90:
        score += 7
    if data.glucose > 126:
        score += 25
    elif data.glucose > 100:
        score += 12
    bmi = data.weight / ((data.height / 100) ** 2)
    if bmi > 30:
        score += 15
    elif bmi > 25:
        score += 7
    if data.smoker:
        score += 20
    if data.alcohol_units > 14:
        score += 10
    elif data.alcohol_units > 7:
        score += 5
    if data.exercise_days == 0:
        score += 10
    elif data.exercise_days < 3:
        score += 5
    if data.sleep_hours < 6:
        score += 8
    elif data.sleep_hours > 9:
        score += 3
    if data.age > 60:
        score += 10
    elif data.age > 45:
        score += 5
    if data.stress_level > 7:
        score += 10
    elif data.stress_level > 5:
        score += 5
    if data.water_intake < 1.5:
        score += 5
    if data.steps_per_day < 3000:
        score += 5
    if data.mood_score < 4:
        score += 5
    if data.screen_time > 8:
        score += 5
    return min(score, 100)

def get_risk_level(score: int) -> str:
    if score <= 30:
        return "Low"
    elif score <= 60:
        return "Medium"
    return "High"

def call_ai_analysis(data: SimulationInput, risk_score: int) -> dict:
    from core.ai_provider import call_ai
    bmi = round(data.weight / ((data.height / 100) ** 2), 1)
    prompt = f"""You are a health AI analyzing a patient's Health Twin simulation.

Patient Data:
- Age: {data.age}, BMI: {bmi}
- Blood Pressure: {data.blood_pressure_systolic}/{data.blood_pressure_diastolic} mmHg
- Heart Rate: {data.heart_rate} BPM, Glucose: {data.glucose} mg/dL
- Sleep: {data.sleep_hours} hrs/night, Exercise: {data.exercise_days} days/week
- Smoker: {data.smoker}, Alcohol: {data.alcohol_units} units/week
- Water: {data.water_intake}L/day, Stress: {data.stress_level}/10
- Diet: {data.diet_type}, Screen time: {data.screen_time} hrs/day
- Steps/day: {data.steps_per_day}, Meditation: {data.meditation_mins} mins/day
- Family history: {data.family_history}, Supplements: {data.supplements}
- Mood: {data.mood_score}/10, Risk Score: {risk_score}/100

Respond ONLY with a JSON object (no markdown, no backticks):
{{
  "summary": "2-3 sentence plain English summary",
  "organ_risks": {{
    "heart": "low|medium|high",
    "lungs": "low|medium|high",
    "liver": "low|medium|high",
    "kidneys": "low|medium|high",
    "brain": "low|medium|high"
  }},
  "organ_causes": {{
    "heart": "main habit causing this risk",
    "lungs": "main habit causing this risk",
    "liver": "main habit causing this risk",
    "kidneys": "main habit causing this risk",
    "brain": "main habit causing this risk"
  }},
  "top_risks": ["risk1", "risk2", "risk3"],
  "recommendations": ["action1", "action2", "action3"],
  "future_timeline": {{
    "5_years": "what could happen in 5 years",
    "10_years": "what could happen in 10 years",
    "20_years": "what could happen in 20 years"
  }}
}}"""
    text = call_ai(prompt)
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        return existing
    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(data: SimulationInput, db: Session = Depends(get_db)):
    risk_score = calculate_risk_score(data)
    risk_level = get_risk_level(risk_score)
    try:
        ai_result = call_ai_analysis(data, risk_score)
        ai_analysis = json.dumps(ai_result)
        future_timeline = json.dumps(ai_result.get("future_timeline", {}))
    except Exception as e:
        ai_analysis = json.dumps({"summary": "Analysis unavailable", "error": str(e)})
        future_timeline = json.dumps({})
    sim = HealthSimulation(
        user_id=data.user_id,
        age=data.age, height=data.height, weight=data.weight,
        blood_pressure_systolic=data.blood_pressure_systolic,
        blood_pressure_diastolic=data.blood_pressure_diastolic,
        heart_rate=data.heart_rate, glucose=data.glucose,
        sleep_hours=data.sleep_hours, exercise_days=data.exercise_days,
        smoker=data.smoker, alcohol_units=data.alcohol_units,
        water_intake=data.water_intake, stress_level=data.stress_level,
        diet_type=data.diet_type, screen_time=data.screen_time,
        steps_per_day=data.steps_per_day, meditation_mins=data.meditation_mins,
        family_history=data.family_history, supplements=data.supplements,
        mood_score=data.mood_score,
        risk_score=risk_score, risk_level=risk_level,
        ai_analysis=ai_analysis, future_timeline=future_timeline
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim

@router.post("/whatif")
def whatif_simulation(data: WhatIfInput, db: Session = Depends(get_db)):
    from core.ai_provider import call_ai
    sim = db.query(HealthSimulation).filter(HealthSimulation.id == data.simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    prompt = f"""Patient health data (Risk Score: {sim.risk_score}/100, Level: {sim.risk_level}):
- Age: {sim.age}, BMI: {round(sim.weight/((sim.height/100)**2), 1)}
- BP: {sim.blood_pressure_systolic}/{sim.blood_pressure_diastolic}, HR: {sim.heart_rate} BPM
- Smoker: {sim.smoker}, Exercise: {sim.exercise_days} days/week
- Stress: {sim.stress_level}/10, Sleep: {sim.sleep_hours} hrs

What-If Scenario: "{data.scenario}"

Respond ONLY with JSON (no markdown):
{{
  "new_risk_score": 0,
  "change": "improved by X points",
  "impact": "2-3 sentences on health impact",
  "additional_benefits": ["benefit1", "benefit2"]
}}"""
    text = call_ai(prompt)
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

@router.get("/history/{user_id}", response_model=List[SimulationResponse])
def get_history(user_id: int, db: Session = Depends(get_db)):
    return db.query(HealthSimulation).filter(
        HealthSimulation.user_id == user_id
    ).order_by(HealthSimulation.created_at.desc()).limit(10).all()
