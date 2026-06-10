from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models.models import Spek
from schemas.schemas import SpekCreate, SpekUpdate, SpekResponse

router = APIRouter(prefix="/api/speks", tags=["speks"])

@router.get("/", response_model=List[SpekResponse])
def get_speks(category: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Spek)
    if category:
        query = query.filter(Spek.category == category)
    if search:
        query = query.filter(
            Spek.title.ilike(f"%{search}%") | Spek.content.ilike(f"%{search}%")
        )
    return query.order_by(Spek.created_at.desc()).all()

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Spek.category).distinct().all()
    return [c[0] for c in categories]

@router.get("/{spek_id}", response_model=SpekResponse)
def get_spek(spek_id: int, db: Session = Depends(get_db)):
    spek = db.query(Spek).filter(Spek.id == spek_id).first()
    if not spek:
        raise HTTPException(status_code=404, detail="Spek not found")
    return spek

@router.post("/", response_model=SpekResponse)
def create_spek(spek: SpekCreate, db: Session = Depends(get_db)):
    db_spek = Spek(**spek.model_dump())
    db.add(db_spek)
    db.commit()
    db.refresh(db_spek)
    return db_spek

@router.put("/{spek_id}", response_model=SpekResponse)
def update_spek(spek_id: int, spek: SpekUpdate, db: Session = Depends(get_db)):
    db_spek = db.query(Spek).filter(Spek.id == spek_id).first()
    if not db_spek:
        raise HTTPException(status_code=404, detail="Spek not found")
    for key, value in spek.model_dump().items():
        setattr(db_spek, key, value)
    db.commit()
    db.refresh(db_spek)
    return db_spek

@router.delete("/{spek_id}")
def delete_spek(spek_id: int, db: Session = Depends(get_db)):
    db_spek = db.query(Spek).filter(Spek.id == spek_id).first()
    if not db_spek:
        raise HTTPException(status_code=404, detail="Spek not found")
    db.delete(db_spek)
    db.commit()
    return {"message": "Spek deleted"}
