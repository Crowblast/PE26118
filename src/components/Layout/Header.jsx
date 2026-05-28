import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Cpu, ShoppingCart } from 'lucide-react';

const Header = () => {
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
          <Link to="/carrito" className="cart-btn" aria-label="Ver carrito">
            <ShoppingCart size={22} />
            <span className="cart-count">2</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
