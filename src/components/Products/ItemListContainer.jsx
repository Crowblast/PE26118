import React, { useState, useEffect } from 'react';
import ItemList from './ItemList';
import { Loader2 } from 'lucide-react';

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate slight API latency for realistic feel
    const timer = setTimeout(() => {
      fetch('/productos.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al cargar los productos');
          }
          return response.json();
        })
        .then((data) => {
          setProducts(data);
          setFilteredProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'todos') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((prod) => prod.categoria === category);
      setFilteredProducts(filtered);
    }
  };

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '40vh',
          gap: '16px',
          color: 'var(--accent-primary)'
        }}
      >
        <Loader2 className="animate-spin" size={40} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          Cargando catálogo tecnológico...
        </span>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--error)' }}>
        <h3>Hubo un problema al cargar el catálogo</h3>
        <p>{error}</p>
      </div>
    );
  }

  const categories = ['todos', ...new Set(products.map((p) => p.categoria))];

  return (
    <div className="catalog-section container animate-fade-in">
      <div className="catalog-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterCategory(cat)}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {cat === 'todos' ? 'Todos los productos' : cat}
          </button>
        ))}
      </div>
      
      <ItemList items={filteredProducts} />
    </div>
  );
};

export default ItemListContainer;
