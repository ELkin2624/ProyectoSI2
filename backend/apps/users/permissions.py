from rest_framework import permissions

class IsInRequiredGroup(permissions.BasePermission):
    """
    Uso:
    - en la vista: required_groups = ["Admin", "Empleado"]
    Permite acceso si el usuario pertenece a cualquier grupo listado en `required_groups`.
    Si `required_groups` no está definido en la vista, permite acceso (no impone restricción).
    """

    def has_permission(self, request, view):
        required = getattr(view, "required_groups", None)
        if not required:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        user_groups = request.user.groups.values_list("name", flat=True)
        return any(g in user_groups for g in required)
