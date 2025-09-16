from pydantic import BaseModel, Field

class PreferencesIn(BaseModel):
    theme: str | None = None
    language: str | None = None
    timezone: str | None = None
    voice_enabled: bool | None = Field(default=None)
    voice_speed: float | None = Field(default=None, ge=0.25, le=4.0)
    auto_advance_steps: bool | None = None
    safety_reminders: bool | None = None
    notifications: bool | None = None

class PreferencesOut(PreferencesIn):
    pass