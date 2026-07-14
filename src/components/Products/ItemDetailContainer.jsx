import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ItemDetail from './ItemDetail';
import { Loader2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const ItemDetailContainer = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDemoMode } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemoMode) {
          // Read from localStorage (simulate DB)
          const localData = localStorage.getItem('tecnomundo_db_products');
          let items = [];
          if (localData) {
            items = JSON.parse(localData);
          } else {
            const response = await fetch('/productos.json');
            if (!response.ok) throw new Error('Error al cargar datos locales');
            items = await response.json();
            localStorage.setItem('tecnomundo_db_products', JSON.stringify(items));
          }
          // The route parameter id is a string, compare correctly (could be numeric in mock mode)
          const foundItem = items.find(item => String(item.id) === String(id));
          if (foundItem) {
            setProduct(foundItem);
          } else {
            setError('El producto solicitado no existe.');
          }
        } else {
          // Firebase Firestore
          if (!db) throw new Error('Firestore no está configurado.');
          const docRef = doc(db, 'productos', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() });
          } else {
            // Check if ID is numeric, maybe it was looking for a pre-seeded id that hasn't synced
            setError('El producto solicitado no existe en Firestore.');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener el producto: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isDemoMode]);


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
