import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { FaShoppingCart, FaArrowLeft, FaCheck } from 'react-icons/fa';

const ItemDetail = ({ item }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(item, quantity);
    setAdded(true);
  };

  return (
    <div className="container detail-section animate-fade-in">
      <Helmet>
        <title>{item.nombre} - Tecno Mundo</title>
        <meta name="description" content={`Compra ${item.nombre} en Tecno Mundo. ${item.descripcion}`} />
      </Helmet>

      <Link to="/productos" className="back-link">
        <FaArrowLeft size={14} style={{ marginRight: '6px' }} />
        Volver al catálogo
      </Link>


      <div className="detail-grid">
        <div className="detail-gallery">
          <div className="detail-img-container">
            <img src={item.imagen} alt={item.nombre} className="detail-img" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <Truck size={20} className="gradient-text" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Envío Rápido</span>
            </div>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <ShieldCheck size={20} className="gradient-text" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Garantía Oficial</span>
            </div>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <RefreshCw size={20} className="gradient-text" />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Cambio Fácil</span>
            </div>
          </div>
        </div>

        <div className="glass-card detail-info-card">
          <span className="detail-category">{item.categoria}</span>
          <h2 className="detail-title">{item.nombre}</h2>
          
          <div className="detail-price">
            {formatPrice(item.precio)}
          </div>
          
          <div className="detail-stock-info">
            <span className={`stock-indicator ${item.stock === 0 ? 'stock-out' : ''}`}></span>
            <span>{item.stock > 0 ? `Stock disponible (${item.stock} unidades)` : 'Sin stock'}</span>
          </div>

          <p className="detail-desc">{item.descripcion}</p>

          <div className="detail-actions">
            {item.stock > 0 && (
              <>
                <div className="cart-item-qty-selector" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    className="qty-btn"
                    disabled={added}
                  >
                    -
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(item.stock, q + 1))} 
                    className="qty-btn"
                    disabled={added}
                  >
                    +
                  </button>
                </div>

                {added ? (
                  <Link to="/carrito" className="btn btn-primary animate-fade-in d-flex align-items-center justify-content-center gap-2" style={{ flexGrow: 1, background: 'linear-gradient(135deg, var(--success), #059669)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)' }}>
                    <FaCheck />
                    <span>Ver en el Carrito</span>
                  </Link>
                ) : (
                  <button onClick={handleAddToCart} className="btn btn-primary d-flex align-items-center justify-content-center gap-2" style={{ flexGrow: 1 }}>
                    <FaShoppingCart />
                    <span>Agregar al Carrito</span>
                  </button>
                )}

              </>
            )}
          </div>

          {item.specs && (
            <div className="specs-section">
              <h4 className="specs-title">Especificaciones Técnicas</h4>
              <div className="specs-grid">
                {Object.entries(item.specs).map(([label, val]) => (
                  <div key={label} className="spec-row">
                    <span className="spec-label">{label}</span>
                    <span className="spec-value">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
