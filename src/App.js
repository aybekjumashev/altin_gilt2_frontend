// src/App.js
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage'; // Buni keyingi qadamda yaratamiz
import ProfilePage from './pages/ProfilePage'; // Buni keyingi qadamda yaratamiz
import ListingDetailPage from './pages/ListingDetailPage';

function App() {
  return (
    <Routes>
      {/* Barcha sahifalar umumiy Layout ichida bo'ladi */}
      <Route element={<Layout />}>
        {/* Hammaga ochiq sahifalar */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* Faqat tizimga kirganlar uchun himoyalangan sahifalar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          {/* Kelajakda boshqa himoyalangan sahifalar shu yerga qo'shiladi */}
          {/* Masalan: <Route path="/listings/new" element={<CreateListingPage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;