import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Cpu } from 'lucide-react';
import { FaShoppingCart, FaUser, FaTools, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  const { getCartCount } = useCart();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Cpu className="logo-icon" size={28} />
          <span>TECNO <span className="gradient-text">MUNDO</span></span>
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/productos" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Productos
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/carrito" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Carrito
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="nav-actions">
          <Link to="/carrito" className="cart-btn animate-fade-in" aria-label="Ver carrito" style={{ position: 'relative' }}>
            <FaShoppingCart size={20} />
            {getCartCount() > 0 && (
              <span className="cart-count" style={{ animation: 'pulse 1.5s infinite' }}>
                {getCartCount()}
              </span>
            )}
          </Link>

          {currentUser ? (
            <div className="d-flex align-items-center gap-2 border-start ps-3 border-secondary ms-2">
              <Link to="/admin" className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)' }}>
                <FaTools size={13} />
                <span className="d-none d-sm-inline">Admin</span>
              </Link>
              <button onClick={handleLogout} className="btn py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: '#ff8a8a', border: '1px solid rgba(239, 68, 68, 0.2)' }} title="Cerrar Sesión">
                <FaSignOutAlt size={13} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-2 ms-2" style={{ fontSize: '13px', background: 'rgba(0, 242, 254, 0.05)', color: 'var(--accent-primary)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
              <FaSignInAlt size={13} />
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

