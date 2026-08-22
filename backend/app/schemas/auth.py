from pydantic import BaseModel
from app.models.user import Role

class LoginRequest(BaseModel): login_id: str; password: str
class UserOut(BaseModel):
    id: str; employee_id: str | None = None; name: str | None = None; email: str | None = None; role: Role
class LoginResponse(BaseModel): access_token: str; token_type: str = "bearer"; user: UserOut
