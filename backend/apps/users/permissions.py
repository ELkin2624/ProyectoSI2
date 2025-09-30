from rest_framework import permissions

class IsInRequiredGroup(permissions.BasePermission):
    """
    Permite acceso si el usuario pertenece a cualquier grupo listado en `required_groups`.
    `required_groups` puede venir:
      - como atributo en la vista (view.required_groups)
      - o como atributo en la vista llamado required_groups_map[action] (seteado en get_permissions)
    Si no hay required_groups definido, permite acceso (comportamiento permisivo por defecto).
    """
    def has_permission(self, request, view):
        required = getattr(view, "required_groups", None)
        if not required:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        user_groups = request.user.groups.values_list("name", flat=True)
        return any(g in user_groups for g in required)
