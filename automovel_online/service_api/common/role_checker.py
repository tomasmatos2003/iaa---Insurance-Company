# from fastapi import Depends, HTTPException, status
# from common.oauth import get_current_user

# def require_role(required_role: str):
#     def role_dependency(user=Depends(get_current_user)):
#         print(user.role)
#         if user.role != required_role:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"Access denied. '{required_role}' role required."
#             )
#         return user
#     return role_dependency