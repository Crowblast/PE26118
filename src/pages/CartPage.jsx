import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { 
  FaTrash, 
  FaShoppingBag, 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheckCircle, 
  FaTrashAlt,
  FaTicketAlt
} from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const CartPage = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  const { isDemoMode } = useAuth();

  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Auto-validate coupon if cart items or total changes
  React.useEffect(() => {
    if (appliedCoupon) {
      const currentTotal = getCartTotal();
      if (currentTotal < appliedCoupon.compraMinima) {
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError(`Cupón removido: la compra mínima para aplicar este cupón es de ${formatPrice(appliedCoupon.compraMinima)}.`);
      }
    }
  }, [cartItems, appliedCoupon]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    const searchCode = couponCode.trim().toUpperCase();

    try {
      let couponsList = [];
      if (isDemoMode) {
        const localData = localStorage.getItem('tecnomundo_db_coupons');
        if (localData) {
          couponsList = JSON.parse(localData);
        } else {
          // Fallback default coupons if not initialized in admin yet
          couponsList = [
            { id: '1', codigo: 'TECNO10', tipo: 'porcentaje', valor: 10, compraMinima: 0, activo: true },
            { id: '2', codigo: 'REGALO3000', tipo: 'fijo', valor: 3000, compraMinima: 15000, activo: true }
          ];
        }
      } else {
        if (!db) throw new Error('Firestore no está inicializado.');
        const colRef = collection(db, 'cupones');
        const snapshot = await getDocs(colRef);
        couponsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const foundCoupon = couponsList.find(c => c.codigo === searchCode);

      if (!foundCoupon) {
        setCouponError('El cupón ingresado no es válido o no existe.');
        setAppliedCoupon(null);
      } else if (!foundCoupon.activo) {
        setCouponError('El cupón ingresado se encuentra inactivo.');
        setAppliedCoupon(null);
      } else if (getCartTotal() < foundCoupon.compraMinima) {
        setCouponError(`La compra mínima para este cupón es de ${formatPrice(foundCoupon.compraMinima)}.`);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(foundCoupon);
        setCouponSuccess(`¡Cupón "${foundCoupon.codigo}" aplicado correctamente!`);
        setCouponCode('');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Error al validar el cupón: ' + err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartTotal();
    
    if (appliedCoupon.tipo === 'porcentaje') {
      return subtotal * (appliedCoupon.valor / 100);
    } else if (appliedCoupon.tipo === 'fijo') {
      return Math.min(appliedCoupon.valor, subtotal);
    }
    return 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() - calculateDiscount();
  };

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
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
                onClick={() => {
                  clearCart();
                  handleRemoveCoupon();
                }} 
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

            {/* Coupon Code Input Section */}
            <div className="coupon-section mt-4 pt-4 border-top border-secondary">
              <h5 className="mb-3 d-flex align-items-center gap-2" style={{ fontSize: '16px' }}>
                <FaTicketAlt style={{ color: 'var(--accent-primary)' }} />
                <span>¿Tienes un cupón de descuento?</span>
              </h5>
              
              <form onSubmit={handleApplyCoupon} className="d-flex gap-2 max-w-md">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: TECNO10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponLoading}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    borderRadius: 'var(--border-radius-sm)',
                    textTransform: 'uppercase',
                    maxWidth: '240px'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-secondary px-4" 
                  disabled={couponLoading || !couponCode.trim()}
                  style={{ borderRadius: 'var(--border-radius-sm)' }}
                >
                  {couponLoading ? 'Aplicando...' : 'Aplicar'}
                </button>
              </form>

              {couponError && (
                <div className="text-danger mt-2" style={{ fontSize: '14px' }}>
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="text-success mt-2 animate-fade-in" style={{ fontSize: '14px', fontWeight: 500 }}>
                  {couponSuccess}
                </div>
              )}
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

            {appliedCoupon && (
              <div className="summary-row" style={{ color: 'var(--accent-primary)', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                <span className="d-flex align-items-center gap-1">
                  Descuento ({appliedCoupon.codigo})
                  <button 
                    onClick={handleRemoveCoupon}
                    className="btn p-0 border-0 ms-1 text-danger d-inline-flex"
                    style={{ background: 'transparent', fontSize: '12px' }}
                    title="Remover cupón"
                  >
                    (quitar)
                  </button>
                </span>
                <span>-{formatPrice(calculateDiscount())}</span>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Total</span>
              <span className="summary-total-val">{formatPrice(getFinalTotal())}</span>
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
