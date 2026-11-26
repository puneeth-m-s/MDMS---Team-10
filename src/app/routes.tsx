import { Navigate, createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
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
          {
        path: 'login',
        handle: { title: 'Login' },
        lazy: async () => ({
          Component: (await import('../features/auth/pages/Login')).default,
        }),
      },
      {
        path: 'forgot-password',
        handle: { title: 'Forgot password' },
        lazy: async () => ({
          Component: (await import('../features/auth/pages/ForgotPassword')).default,
        }),
      },
      {
        path: 'reset-password/:token',
        handle: { title: 'Reset password' },
        lazy: async () => ({
          Component: (await import('../features/auth/pages/ResetPassword')).default,
        }),
      },

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
                  page("dashboard", "Zone dashboard"),
                  page("meters", "Meter management"),
                  page("meters/:meterId", "Meter details"),
                  page("users", "User management"),
                  page("reports", "Reports & analytics"),
                  page("alerts", "Alerts"),
                  page("settings", "Zone settings"),
                ],
              },

              {
                path: "enterprise",
                children: [
                  redirectTo("dashboard"),
                  page("dashboard", "Enterprise dashboard"),
                  page("zones", "Zone management"),
                  page("zones/:zoneId", "Zone details"),
                  page("meters", "Meter management"),
                  page("users", "User & role management"),
                  page("reports", "Reports & analytics"),
                  page("alerts", "Alerts"),
                  page("audit-logs", "Audit logs"),
                  page("settings", "Settings & configuration"),
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
