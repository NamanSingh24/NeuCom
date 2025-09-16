from sqlalchemy import Column, Integer, Boolean, Float, ForeignKey, DateTime,String, func
from sqlalchemy.orm import relationship
from Database.database import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    theme = Column(String(32), nullable=True)
    language = Column(String(16), nullable=True)
    timezone = Column(String(64), nullable=True)
    voice_enabled = Column(Boolean, default=False)
    voice_speed = Column(Float, default=1.0)
    auto_advance_steps = Column(Boolean, default=False)
    safety_reminders = Column(Boolean, default=True)
    notifications = Column(Boolean, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="preferences", uselist=False)