import React from 'react';
import Item from './Item';

const ItemList = ({ items }) => {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        No se encontraron productos en esta categoría.
      </div>
    );
  }

  return (
    <div className="grid-container grid-cols-4 animate-fade-in">
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemList;
