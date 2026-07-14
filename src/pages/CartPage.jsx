import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaArrowRight, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';

const CartPage = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    setCheckoutComplete(true);
    clearCart();
  };

  return (
    <section className="cart-section container animate-fade-in">
      <Helmet>
        <title>Mi Carrito - Tecno Mundo</title>
        <meta name="description" content="Revisa tu carrito de compras de tecnología en Tecno Mundo antes de proceder al pago." />
      </Helmet>

      {checkoutComplete ? (
        <div 
          className="glass-card empty-cart-state" 
          style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--success)' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--success)', margin: '0 auto 20px auto', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <FaCheckCircle size={36} />
          </div>
          <h3>¡Pedido Realizado con Éxito!</h3>
          <p>
            Tu orden ha sido registrada. Muchas gracias por confiar en Tecno Mundo para tu compra de tecnología.
          </p>
          <Link to="/productos" className="btn btn-primary">
            Volver a la Tienda
          </Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="glass-card empty-cart-state" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <FaShoppingBag size={48} className="empty-cart-icon" style={{ color: 'var(--text-muted)' }} />
          <h3>Tu carrito está vacío</h3>
          <p>
            Parece que aún no has agregado productos a tu compra. ¡Explora nuestro catálogo y equipa tu setup hoy mismo!
          </p>
          <Link to="/productos" className="btn btn-primary">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="glass-card cart-items-card">
            <div className="cart-title-section d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h3 style={{ fontSize: '22px', margin: 0 }}>Mi Carrito ({getCartCount()} productos)</h3>
              <button 
                onClick={clearCart} 
                className="btn btn-secondary py-2 px-3 d-flex align-items-center gap-2"
                style={{ fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: '#ff8a8a', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <FaTrashAlt size={12} />
                <span>Vaciar Carrito</span>
              </button>
            </div>
            
            <div className="cart-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-img-container">
                    <img src={item.imagen} alt={item.nombre} className="cart-item-img" />
                  </div>
                  
                  <div className="cart-item-info">
                    <span className="cart-item-category">{item.categoria}</span>
                    <h4>{item.nombre}</h4>
                  </div>
                  
                  <div className="cart-item-qty">
                    <div className="cart-item-qty-selector">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="qty-btn"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.cantidad}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="qty-btn"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-price-unit">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total</span>
                    <span>{formatPrice(item.precio * item.cantidad)}</span>
                  </div>
                  
                  <div className="cart-item-remove">
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="remove-item-btn"
                      title="Eliminar producto"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link to="/productos" className="back-link" style={{ marginBottom: 0 }}>
                <FaArrowLeft size={13} style={{ marginRight: '6px' }} />
                Seguir comprando
              </Link>
            </div>
          </div>

          <div className="glass-card cart-summary-card">
            <h3 className="summary-title">Resumen de Compra</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="summary-row">
              <span>Envío</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Gratis</span>
            </div>

            <div className="summary-row">
              <span>Impuestos</span>
              <span>Incluidos</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span className="summary-total-val">{formatPrice(getCartTotal())}</span>
            </div>
            
            <button onClick={handleCheckout} className="btn btn-primary checkout-btn d-flex align-items-center justify-content-center gap-2">
              <span>Iniciar Pago</span>
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartPage;

