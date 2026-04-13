from rest_framework.permissions import BasePermission
from accounts.models import RoleEnum


class IsOwner(BasePermission):
    """Allows access only to users with the 'owner' role."""
    message = "Only court owners can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == RoleEnum.OWNER

    def has_object_permission(self, request, view, obj):
        # Many models use 'owner' field (FutsalCourt, Tournament)
        if hasattr(obj, 'owner') and obj.owner:
            return obj.owner == request.user
        return False


class IsOwnerOfCourt(BasePermission):
    """Object-level: only the owner of the court can modify it."""
    message = "You do not own this court."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsAdminOrOwner(BasePermission):
    """Allows access to admins or owners."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in [RoleEnum.ADMIN, RoleEnum.OWNER, RoleEnum.SUPERUSER]
        )