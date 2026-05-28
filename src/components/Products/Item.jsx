import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Item = ({ item }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <article className="glass-card product-card">
      <div className="product-image-wrapper">
        <span className="product-tag">{item.categoria}</span>
        <img 
          src={item.imagen} 
          alt={item.nombre} 
          className="product-card-img"
          loading="lazy"
        />
      </div>
      
      <div className="product-info">
        <h4 className="product-name">{item.nombre}</h4>
        <p className="product-desc">{item.descripcion}</p>
        
        <div className="product-footer">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Precio</span>
            <span className="product-price">{formatPrice(item.precio)}</span>
          </div>
          <Link 
            to={`/producto/${item.id}`} 
            className="product-btn" 
            title="Ver detalle del producto"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Item;
