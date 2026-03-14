/**
 * Role hierarchy — higher index = more permissions
 * ADMIN can do everything EDITOR and USER can.
 * EDITOR can do everything USER can.
 */
const ROLE_HIERARCHY = ["USER", "EDITOR", "ADMIN"];

/**
 * Returns middleware that blocks anyone below the required role.
 *
 * Usage:
 *   router.delete("/topic/:id", authenticate, requireRole("ADMIN"), handler)
 *   router.post("/news",        authenticate, requireRole("EDITOR"), handler)
 *
 * @param {"USER" | "EDITOR" | "ADMIN"} minimumRole
 */
const requireRole = (minimumRole) => {
    return (req, res, next) => {
        // authenticate must run first — if somehow it didn't, fail safe
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthenticated — run authenticate middleware first",
            });
        }

        const userRoleIndex = ROLE_HIERARCHY.indexOf(req.user.role);
        const minimumRoleIndex = ROLE_HIERARCHY.indexOf(minimumRole);

        if (userRoleIndex < minimumRoleIndex) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${minimumRole}. Your role: ${req.user.role}`,
            });
        }

        next();
    };
};

// Shortcut to keep route readable
const requireAdmin = requireRole("ADMIN");
const requireEditor = requireRole("EDITOR");

module.exports = { requireRole, requireAdmin, requireEditor };
