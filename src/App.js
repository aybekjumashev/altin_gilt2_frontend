
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage'; // Buni keyingi qadamda yaratamiz
import ProfilePage from './pages/ProfilePage'; // Buni keyingi qadamda yaratamiz
import ListingDetailPage from './pages/ListingDetailPage';
import MessagesPage from './pages/MessagesPage';
import ListingFormPage from './pages/ListingFormPage'; 

function App() {
  return (
    <Routes>
      
      <Route element={<Layout />}>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/listings/new" element={<ListingFormPage />} />
          <Route path="/messages/:listingId" element={<MessagesPage />} />
          <Route path="/listings/:id/edit" element={<ListingFormPage />} />
          
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;