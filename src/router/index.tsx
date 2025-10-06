import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ROUTES } from '@/lib/constants'

// Pages
import HomePage from '@/pages/Home'
import DashboardPage from '@/pages/Dashboard'
import CVBuilderPage from '@/pages/CVBuilder'
import CoverLetterPage from '@/pages/CoverLetter'
import JobListingsPage from '@/pages/JobListings'
import ProfilePage from '@/pages/Profile'
import SettingsPage from '@/pages/Settings'
import NotFoundPage from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.CV_BUILDER,
        element: <CVBuilderPage />,
      },
      {
        path: ROUTES.COVER_LETTER,
        element: <CoverLetterPage />,
      },
      {
        path: ROUTES.JOBS,
        element: <JobListingsPage />,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProfilePage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
])
