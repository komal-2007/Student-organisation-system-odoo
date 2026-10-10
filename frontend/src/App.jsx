import { Navigate, Route, Routes } from 'react-router-dom';
import PublicDashboard from './dashboards/public/PublicDashboard';
import EventDetails from './dashboards/public/components/EventDetails';
import ProductDetail from './dashboards/public/components/ProductDetail';
import AdminDashboard from './dashboards/admin/AdminDashboard';
import MemberDashboard from './dashboards/member/MemberDashboard';
import CoreMemberDashboard from './dashboards/core-member/CoreMemberDashboard';
import ProtectedDashboard from './routing/ProtectedDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicDashboard />} />
      <Route path="/events" element={<PublicDashboard variant="events" />} />
      <Route path="/events/:eventId" element={<EventDetails />} />
      <Route path="/merchandise" element={<PublicDashboard variant="merchandise" />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      <Route path="/signin" element={<PublicDashboard variant="signin" />} />
      <Route path="/admin" element={<ProtectedDashboard role="admin"><AdminDashboard /></ProtectedDashboard>} />
      <Route path="/member" element={<ProtectedDashboard role="member"><MemberDashboard /></ProtectedDashboard>} />
      <Route path="/core-member" element={<ProtectedDashboard role="core_member"><CoreMemberDashboard /></ProtectedDashboard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
