import React from 'react';
import ItemListContainer from '../components/Products/ItemListContainer';

const ProductsPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="container">
          <span className="hero-subtitle">Catálogo</span>
          <h2 className="page-title">Explora nuestra colección de Tecnología</h2>
          <p className="page-subtitle">
            Componentes seleccionados bajo los más altos estándares de calidad y rendimiento para equipar tu entorno digital.
          </p>
        </div>
      </div>
      
      {/* Product Catalog */}
      <ItemListContainer />

    </div>
  );
};

export default ProductsPage;
