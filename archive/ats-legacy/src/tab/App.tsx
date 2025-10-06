import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import JobsPage from './pages/JobsPage';
import TrackerPage from './pages/TrackerPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="panel" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
