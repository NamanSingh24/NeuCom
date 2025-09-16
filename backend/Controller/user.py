from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from Modals.user import User
from Schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str) -> Optional[User]:
	return db.query(User).filter(User.email == email).first()

def create_user(db: Session, data: UserCreate) -> User:
	existing = get_user_by_email(db, data.email)
	if existing:
		raise ValueError("User already exists")
	password_hash = pwd_context.hash(data.password)
	user = User(email=data.email, name=data.name, password_hash=password_hash)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user

def verify_password(plain_password: str, password_hash: str) -> bool:
	return pwd_context.verify(plain_password, password_hash)