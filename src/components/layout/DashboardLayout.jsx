import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar hasSidebar={true} />
        <div className="page-container animate-fade">
          {children}
        </div>
      </div>
    </div>
  );
}
