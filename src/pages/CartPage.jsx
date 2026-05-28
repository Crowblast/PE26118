import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const CartPage = () => {
  // Pre-load two items so the cart has mock content, showing off the styling
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      nombre: "Auriculares Inalámbricos AeroSound X",
      precio: 12999,
      categoria: "audio",
      imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      cantidad: 1,
      stock: 15
    },
    {
      id: 3,
      nombre: "Mouse Gamer G-Force Neon",
      precio: 4999,
      categoria: "perifericos",
      imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
      cantidad: 2,
      stock: 25
    }
  ]);

  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const updateQuantity = (id, change) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.cantidad + change;
          return {
            ...item,
            cantidad: Math.max(1, Math.min(item.stock, newQty))
          };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setCartItems([]);
  };

  return (
    <section className="cart-section container animate-fade-in">
      {checkoutComplete ? (
        <div 
          className="glass-card empty-cart-state" 
          style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--success)' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--success)', margin: '0 auto 20px auto', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={36} />
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
          <ShoppingBag size={48} className="empty-cart-icon" />
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
            <div className="cart-title-section">
              <h3 style={{ fontSize: '22px' }}>Mi Carrito ({cartItems.reduce((acc, item) => acc + item.cantidad, 0)} productos)</h3>
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
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link to="/productos" className="back-link" style={{ marginBottom: 0 }}>
                <ArrowLeft size={16} />
                Seguir comprando
              </Link>
            </div>
          </div>

          <div className="glass-card cart-summary-card">
            <h3 className="summary-title">Resumen de Compra</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(calculateSubtotal())}</span>
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
              <span className="summary-total-val">{formatPrice(calculateSubtotal())}</span>
            </div>
            
            <button onClick={handleCheckout} className="btn btn-primary checkout-btn">
              Iniciar Pago
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartPage;
