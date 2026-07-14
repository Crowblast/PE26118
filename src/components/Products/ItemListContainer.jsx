import React, { useState, useEffect } from 'react';
import ItemList from './ItemList';
import { Loader2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';

const SearchContainer = styled.div`
  margin-bottom: 30px;
  max-width: 600px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const StyledSearchInput = styled(Form.Control)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  padding: 12px 18px 12px 45px !important;
  border-radius: var(--border-radius-sm) !important;
  font-size: 15px;
  transition: var(--transition-fast) !important;

  &:focus {
    border-color: var(--accent-primary) !important;
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2) !important;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 10;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 20px;

  .pagination {
    margin-bottom: 0;
    gap: 6px;
  }

  .page-link {
    background: rgba(20, 22, 31, 0.6);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 16px;
    border-radius: var(--border-radius-sm);
    transition: var(--transition-fast);
    font-weight: 600;

    &:hover {
      background: var(--accent-primary);
      color: #0b0d17;
      border-color: var(--accent-primary);
    }
  }

  .page-item.active .page-link {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    border-color: transparent;
    color: #0b0d17;
  }

  .page-item.disabled .page-link {
    background: rgba(255, 255, 255, 0.02);
    border-color: var(--border-color);
    color: var(--text-muted);
    opacity: 0.5;
  }
`;

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { isDemoMode } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemoMode) {
          // Read from localStorage (simulate DB)
          const localData = localStorage.getItem('tecnomundo_db_products');
          if (localData) {
            setProducts(JSON.parse(localData));
          } else {
            // Seeding if not present
            const response = await fetch('/productos.json');
            if (!response.ok) throw new Error('Error al cargar datos localmente');
            const data = await response.json();
            localStorage.setItem('tecnomundo_db_products', JSON.stringify(data));
            setProducts(data);
          }
        } else {
          // Firebase Firestore
          if (!db) throw new Error('Firestore no está configurado.');
          const colRef = collection(db, 'productos');
          const snapshot = await getDocs(colRef);
          let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Auto-seed if Firestore database is empty
          if (list.length === 0) {
            const response = await fetch('/productos.json');
            const defaultProds = await response.json();
            
            const seedPromises = defaultProds.map(async (prod) => {
              const { id, ...prodData } = prod;
              const { addDoc } = await import('firebase/firestore');
              const newDoc = await addDoc(colRef, prodData);
              return { id: newDoc.id, ...prodData };
            });
            list = await Promise.all(seedPromises);
            console.log("Firestore seeded on container load!");
          }

          setProducts(list);
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener productos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isDemoMode]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Real-time search and category filtering
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'todos' || prod.categoria === selectedCategory;
    const matchesSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll smoothly to catalog header
    const element = document.getElementById('catalogo-header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
      <div className="text-center py-5" style={{ color: 'var(--error)' }}>
        <AlertCircle size={48} className="mb-3" />
        <h3>Hubo un problema al cargar el catálogo</h3>
        <p>{error}</p>
      </div>
    );
  }

  const categories = ['todos', ...new Set(products.map((p) => p.categoria))];

  return (
    <Container className="catalog-section animate-fade-in" id="catalogo-header">
      <Helmet>
        <title>Productos Tecnológicos - Tecno Mundo</title>
        <meta name="description" content="Explora nuestro catálogo de tecnología. Audífonos inalámbricos, teclados mecánicos, smartwatch deportivos y mucho más." />
      </Helmet>

      {/* Search Bar */}
      <SearchContainer>
        <div style={{ position: 'relative' }}>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <StyledSearchInput
            type="text"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </SearchContainer>

      {/* Category Tabs */}
      <div className="catalog-filters mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {cat === 'todos' ? 'Todos los productos' : cat}
          </button>
        ))}
      </div>
      
      {/* Product List */}
      <ItemList items={currentItems} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationWrapper>
          <Pagination>
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item 
                key={idx + 1} 
                active={currentPage === idx + 1}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </PaginationWrapper>
      )}
    </Container>
  );
};

export default ItemListContainer;

