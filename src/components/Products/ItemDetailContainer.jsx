import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ItemDetail from './ItemDetail';
import { Loader2, AlertCircle } from 'lucide-react';

const ItemDetailContainer = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/productos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar la información del producto');
        }
        return response.json();
      })
      .then((data) => {
        // Parse id from route params and search product
        const itemId = parseInt(id, 10);
        const foundItem = data.find((item) => item.id === itemId);
        
        if (foundItem) {
          setProduct(foundItem);
        } else {
          setError('El producto solicitado no existe.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: '16px',
          color: 'var(--accent-primary)'
        }}
      >
        <Loader2 className="animate-spin" size={40} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          Cargando detalles de producto...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="container" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: '20px',
          textAlign: 'center'
        }}
      >
        <AlertCircle size={48} style={{ color: 'var(--error)' }} />
        <div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>¡Ups! Hubo un problema</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
        <Link to="/productos" className="btn btn-secondary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {product && <ItemDetail item={product} />}
    </div>
  );
};

export default ItemDetailContainer;
