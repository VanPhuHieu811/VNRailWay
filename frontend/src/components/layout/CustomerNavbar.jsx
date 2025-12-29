import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrainFront, Ticket, User, Search } from 'lucide-react';
import '../../styles/components/CustomerNavbar.css';

const CustomerNavbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'Khách' };

  // Hàm kiểm tra link đang active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <TrainFront size={28} /> VNRailway
      </Link>

      <div className="nav-links">
        <Link to="/customer/dashboard" className={`nav-item ${isActive('/customer/dashboard')}`}>
          <Search size={18} /> Tìm chuyến
        </Link>
        
        {/* Giả lập trang vé của tôi */}
        <Link to="/my-tickets" className={`nav-item ${isActive('/my-tickets')}`}>
          <Ticket size={18} /> Vé của tôi
        </Link>

        <Link to="/profile" className="user-profile" style={{textDecoration: 'none'}}>
          <User size={18} />
          <span>{user.fullName}</span>
        </Link>
      </div>
    </nav>
  );
};

export default CustomerNavbar;