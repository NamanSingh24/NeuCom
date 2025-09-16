from sqlalchemy.orm import Session
from Modals.user_preference import UserPreferences
from Schemas.user_preference import PreferencesIn

def get_or_create(db: Session, user_id: int) -> UserPreferences:
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

def update(db: Session, user_id: int, data: PreferencesIn) -> UserPreferences:
    prefs = get_or_create(db, user_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(prefs, k, v)
    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return prefs