from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from Database.database import get_db
from Schemas.user_preference import PreferencesIn, PreferencesOut
from Controller import user_prefernce as pref_crud

router = APIRouter(prefix="/preferences", tags=["preferences"])

@router.get("", response_model=PreferencesOut)
def read_preferences(
	user_id: int = Query(..., description="User ID for which to fetch preferences"),
	db: Session = Depends(get_db),
):
	prefs = pref_crud.get_or_create(db, user_id)
	return PreferencesOut(**{k: getattr(prefs, k) for k in PreferencesOut.__fields__.keys()})

@router.post("", response_model=PreferencesOut)
def write_preferences(
	payload: PreferencesIn,
	user_id: int = Query(..., description="User ID to update preferences for"),
	db: Session = Depends(get_db),
):
	prefs = pref_crud.update(db, user_id, payload)
	return PreferencesOut(**{k: getattr(prefs, k) for k in PreferencesOut.__fields__.keys()})


