import { Navigate, createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import type { ComponentType } from "react";
import AppLayout from "../features/auth/layout/AppLayout";
import {
  AccessDeniedPage,
  MaintenancePage,
  NotFoundPage,
  ServerErrorPage,
} from "../features/auth/routes/UtilityPages";

/**
 * Builds a lazy-loaded route. For now every page is the temporary placeholder.
 * When you build a real page, swap its entry for a real lazy import, e.g.:
 *
 *   {
 *     path: 'dashboard',
 *     lazy: async () => ({
 *       Component: (await import('../features/end-user/pages/Dashboard')).default,
 *     }),
 *   }
 */
const page = (path: string, title: string): RouteObject => ({
  path,
  handle: { title },
  lazy: async () => ({
    Component: (await import("../features/auth/components/PlaceholderPage"))
      .default,
  }),
});

const zonePage = (
  path: string,
  title: string,
  loader: () => Promise<{ default: ComponentType }>,
): RouteObject => ({
  path,
  handle: { title },
  lazy: async () => ({
    Component: (await loader()).default,
  }),
});

const enterprisePage = (
  path: string,
  title: string,
  loader: () => Promise<{ default: ComponentType }>,
): RouteObject => ({
  path,
  handle: { title },
  lazy: async () => ({
    Component: (await loader()).default,
  }),
});

const redirectTo = (to: string): RouteObject => ({
  index: true,
  element: <Navigate to={to} replace />,
});

/**
 * Component test page at /dev/components.
 * It only exists while running `npm run dev`; it is removed from production builds.
 */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "dev/components",
        handle: { title: "Component demo" },
        lazy: async () => ({
          Component: (await import("../features/auth/pages/ComponentsDemo"))
            .default,
        }),
      },
    ]
  : [];

export const router = createBrowserRouter([
  {
    // Catches anything that breaks outside the main layout (500 page).
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },

      /* ---------- Auth screens ---------- */
      page("login", "Login"),
      page("forgot-password", "Forgot password"),
      page("reset-password/:token", "Reset password"),

      /* ---------- Utility pages ---------- */
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "access-denied", element: <AccessDeniedPage /> },

      /* ---------- Main app: one shared layout for all roles ---------- */
      {
        element: <AppLayout />,
        children: [
          {
            // A page that breaks shows the 500 screen inside the layout,
            // so the header and sidebar stay usable.
            errorElement: <ServerErrorPage />,
            children: [
              page("profile", "Profile & Settings"),
              ...devRoutes,

              {
                path: "user",
                children: [
                  redirectTo("dashboard"),
                  page("dashboard", "Dashboard"),
                  page("bills", "My bills"),
                  page("bills/:billId", "Bill details"),
                  page("meter-data", "Meter data"),
                  page("alerts", "Alerts & Notifications"),
                ],
              },

              {
                path: "zone",
                children: [
                  redirectTo("dashboard"),
                  zonePage("dashboard", "Zone dashboard", () => import("../features/zone/pages/Dashboard")),
                  zonePage("meters", "Meter management", () => import("../features/zone/pages/MeterManagement")),
                  zonePage("meters/:meterId", "Meter details", () => import("../features/zone/pages/MeterDetails")),
                  zonePage("users", "User management", () => import("../features/zone/pages/UserManagement")),
                  zonePage("reports", "Reports & analytics", () => import("../features/zone/pages/Reports")),
                  zonePage("alerts", "Alerts", () => import("../features/zone/pages/Alerts")),
                  zonePage("settings", "Zone settings", () => import("../features/zone/pages/Settings")),
                ],
              },

              {
                path: "enterprise",
                children: [
                  redirectTo("dashboard"),
                  enterprisePage("dashboard", "Enterprise dashboard", () => import("../features/enterprise/pages/Dashboard")),
                  enterprisePage("zones", "Zone management", () => import("../features/enterprise/pages/ZoneManagement")),
                  enterprisePage("zones/:zoneId", "Zone details", () => import("../features/enterprise/pages/ZoneDetails")),
                  enterprisePage("meters", "Meter management", () => import("../features/enterprise/pages/MeterManagement")),
                  enterprisePage("users", "User & role management", () => import("../features/enterprise/pages/UserManagement")),
                  enterprisePage("reports", "Reports & analytics", () => import("../features/enterprise/pages/Reports")),
                  enterprisePage("alerts", "Alerts", () => import("../features/enterprise/pages/Alerts")),
                  enterprisePage("audit-logs", "Audit logs", () => import("../features/enterprise/pages/AuditLogs")),
                  enterprisePage("settings", "Settings & configuration", () => import("../features/enterprise/pages/Settings")),
                ],
              },
            ],
          },
        ],
      },

      /* ---------- Catch-all ---------- */
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
