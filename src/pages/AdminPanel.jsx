import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaSignOutAlt, 
  FaTools, 
  FaShoppingBag,
  FaRedo
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StyledContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 80px;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
`;

const ControlButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition-normal);
`;

const GlassTableCard = styled.div`
  background: rgba(20, 22, 31, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 24px;
  overflow-x: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
`;

const DarkTable = styled(Table)`
  color: #ffffff !important;
  margin-bottom: 0;

  th {
    border-bottom: 2px solid rgba(255,255,255,0.1) !important;
    color: #ffffff !important;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.05em;
    padding: 16px;
    background: transparent !important;
  }

  td {
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    color: #ffffff !important;
    padding: 16px;
    vertical-align: middle;
    background: transparent !important;
    font-size: 14px;
  }

  tr:hover td {
    background: rgba(255,255,255,0.02) !important;
  }
`;

const Thumbnail = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const FormLabel = styled(Form.Label)`
  color: #ffffff !important;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
`;

const FormInput = styled(Form.Control)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid var(--border-color) !important;
  color: #ffffff !important;
  border-radius: var(--border-radius-sm) !important;
  padding: 10px 14px !important;

  &:focus {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2) !important;
    color: #ffffff !important;
  }

  &::placeholder {
    color: var(--text-muted) !important;
  }
`;

const FormTextArea = styled(Form.Control)`
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid var(--border-color) !important;
  color: #ffffff !important;
  border-radius: var(--border-radius-sm) !important;
  padding: 10px 14px !important;

  &:focus {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2) !important;
    color: #ffffff !important;
  }
`;

const FormSelect = styled(Form.Select)`
  background-color: rgba(20, 22, 31, 0.9) !important;
  border: 1px solid var(--border-color) !important;
  color: #ffffff !important;
  border-radius: var(--border-radius-sm) !important;
  padding: 10px 14px !important;

  &:focus {
    background-color: rgba(20, 22, 31, 0.9) !important;
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2) !important;
    color: #ffffff !important;
  }

  option {
    background-color: rgb(20, 22, 31) !important;
    color: #ffffff !important;
  }
`;

const AdminPanel = () => {
  const { logout, isDemoMode, currentUser } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new product

  // Form Fields
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    descripcion: '',
    imagen: '',
    stock: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Operations loading state (creating, editing, deleting)
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      if (isDemoMode) {
        // Read from localStorage, fallback to products.json if empty
        const localData = localStorage.getItem('tecnomundo_db_products');
        if (localData) {
          setProducts(JSON.parse(localData));
        } else {
          const response = await fetch('/productos.json');
          if (!response.ok) throw new Error('Error al cargar datos demo');
          const data = await response.json();
          // Store locally
          localStorage.setItem('tecnomundo_db_products', JSON.stringify(data));
          setProducts(data);
        }
      } else {
        // Firestore real connection
        if (!db) throw new Error('Firestore no está inicializado.');
        const colRef = collection(db, 'productos');
        const snapshot = await getDocs(colRef);
        let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // If Firestore is empty, seed it with default products!
        if (list.length === 0) {
          const response = await fetch('/productos.json');
          const defaultProds = await response.json();
          const seedPromises = defaultProds.map(async (prod) => {
            const { id, ...prodData } = prod;
            const newDoc = await addDoc(colRef, prodData);
            return { id: newDoc.id, ...prodData };
          });
          list = await Promise.all(seedPromises);
          console.log("Firestore seeded successfully!");
        }
        
        setProducts(list);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener la lista de productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isDemoMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Error al cerrar sesión: ' + err.message);
    }
  };

  // Open form modal for adding
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      precio: '',
      categoria: 'perifericos',
      descripcion: '',
      imagen: '',
      stock: ''
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Open form modal for editing
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre || '',
      precio: product.precio || '',
      categoria: product.categoria || 'perifericos',
      descripcion: product.descripcion || '',
      imagen: product.imagen || '',
      stock: product.stock || ''
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
    
    if (!formData.precio) {
      errors.precio = 'El precio es obligatorio.';
    } else if (parseFloat(formData.precio) <= 0) {
      errors.precio = 'El precio debe ser mayor a 0.';
    }

    if (!formData.categoria) errors.categoria = 'La categoría es obligatoria.';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria.';
    
    if (!formData.imagen.trim()) {
      errors.imagen = 'La URL de la imagen es obligatoria.';
    } else if (!formData.imagen.startsWith('http://') && !formData.imagen.startsWith('https://')) {
      errors.imagen = 'Debe ser una URL válida de imagen (ej: https://...).';
    }

    if (formData.stock === '' || formData.stock === undefined) {
      errors.stock = 'El stock es obligatorio.';
    } else if (parseInt(formData.stock, 10) < 0) {
      errors.stock = 'El stock no puede ser negativo.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    const formattedProduct = {
      nombre: formData.nombre.trim(),
      precio: parseFloat(formData.precio),
      categoria: formData.categoria.trim().toLowerCase(),
      descripcion: formData.descripcion.trim(),
      imagen: formData.imagen.trim(),
      stock: parseInt(formData.stock, 10)
    };

    try {
      if (isDemoMode) {
        // LocalStorage CRUD simulation
        let updatedList = [...products];
        if (editingProduct) {
          // Edit
          updatedList = updatedList.map(p => 
            p.id === editingProduct.id ? { ...p, ...formattedProduct } : p
          );
          setSuccess('Producto actualizado con éxito (Local)');
        } else {
          // Create
          const newProd = {
            id: Date.now(), // Numeric ID for local simulation
            ...formattedProduct
          };
          updatedList.push(newProd);
          setSuccess('Producto agregado con éxito (Local)');
        }
        localStorage.setItem('tecnomundo_db_products', JSON.stringify(updatedList));
        setProducts(updatedList);
        setShowFormModal(false);
      } else {
        // Firestore CRUD
        const colRef = collection(db, 'productos');
        if (editingProduct) {
          const docRef = doc(db, 'productos', editingProduct.id);
          await updateDoc(docRef, formattedProduct);
          setSuccess('Producto actualizado correctamente en la nube.');
        } else {
          await addDoc(colRef, formattedProduct);
          setSuccess('Producto agregado correctamente a la nube.');
        }
        await fetchProducts(); // Reload from db
        setShowFormModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  // Confirm Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isDemoMode) {
        const updatedList = products.filter(p => p.id !== productToDelete.id);
        localStorage.setItem('tecnomundo_db_products', JSON.stringify(updatedList));
        setProducts(updatedList);
        setSuccess('Producto eliminado con éxito (Local).');
      } else {
        const docRef = doc(db, 'productos', productToDelete.id);
        await deleteDoc(docRef);
        setSuccess('Producto eliminado correctamente de la nube.');
        await fetchProducts();
      }
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar producto: ' + err.message);
    } finally {
      setActionLoading(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <StyledContainer className="animate-fade-in">
      <Helmet>
        <title>Panel de Administración - Tecno Mundo</title>
        <meta name="description" content="Gestiona el catálogo de productos de Tecno Mundo. Agrega, edita y elimina artículos de la base de datos." />
      </Helmet>

      <AdminHeader>
        <div>
          <span className="hero-subtitle d-flex align-items-center gap-2">
            <FaTools size={14} /> Panel Administrativo
          </span>
          <h2 className="m-0 font-display">Gestión de Inventario</h2>
          <small className="text-secondary">
            Conectado como: <strong>{currentUser?.email}</strong> {isDemoMode && <span className="badge bg-warning text-dark ms-2">Modo Demo</span>}
          </small>
        </div>

        <div className="d-flex gap-2">
          <ControlButton variant="secondary" onClick={fetchProducts} disabled={loading} title="Sincronizar base de datos">
            <FaRedo className={loading ? 'spin-anim' : ''} />
            <span>Actualizar</span>
          </ControlButton>

          <ControlButton variant="primary" onClick={handleOpenAdd}>
            <FaPlus />
            <span>Nuevo Producto</span>
          </ControlButton>

          <ControlButton variant="danger" onClick={handleLogout} className="btn-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ff8a8a' }}>
            <FaSignOutAlt />
            <span>Salir</span>
          </ControlButton>
        </div>
      </AdminHeader>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" className="mb-3" />
          <p className="text-secondary font-display">Cargando inventario de productos...</p>
        </div>
      ) : (
        <GlassTableCard>
          {products.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <FaShoppingBag size={48} className="mb-3" style={{ opacity: 0.5 }} />
              <h4>No hay productos registrados</h4>
              <p>Haz clic en "Nuevo Producto" para comenzar a armar el catálogo.</p>
            </div>
          ) : (
            <DarkTable responsive hover>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <Thumbnail src={prod.imagen} alt={prod.nombre} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'; }} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{prod.nombre}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span className="badge bg-dark border border-secondary text-light px-2 py-1">{prod.categoria}</span>
                    </td>
                    <td>{formatPrice(prod.precio)}</td>
                    <td>
                      <span style={{ color: prod.stock <= 3 ? 'var(--error)' : 'inherit', fontWeight: prod.stock <= 3 ? 600 : 400 }}>
                        {prod.stock} uds.
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(prod)}
                        >
                          <FaEdit size={13} />
                          <span>Editar</span>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(prod)}
                        >
                          <FaTrashAlt size={13} />
                          <span>Borrar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DarkTable>
          )}
        </GlassTableCard>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal 
        show={showFormModal} 
        onHide={() => !actionLoading && setShowFormModal(false)}
        backdrop="static" 
        centered
        contentClassName="bg-dark text-light border border-secondary"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="gradient-text font-display">
            {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <FormLabel>Nombre del Producto *</FormLabel>
              <FormInput 
                type="text" 
                placeholder="Ej. Teclado Mecánico Apex"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                isInvalid={!!formErrors.nombre}
                disabled={actionLoading}
              />
              <Form.Control.Feedback type="invalid">{formErrors.nombre}</Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <FormLabel>Precio (ARS) *</FormLabel>
                  <FormInput 
                    type="number" 
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    isInvalid={!!formErrors.precio}
                    disabled={actionLoading}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.precio}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <FormLabel>Stock Inicial *</FormLabel>
                  <FormInput 
                    type="number" 
                    placeholder="0"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    isInvalid={!!formErrors.stock}
                    disabled={actionLoading}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.stock}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

             <Form.Group className="mb-3">
              <FormLabel>Categoría *</FormLabel>
              <FormSelect 
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                isInvalid={!!formErrors.categoria}
                disabled={actionLoading}
              >
                <option value="perifericos">Periféricos</option>
                <option value="audio">Audio</option>
                <option value="wearables">Wearables</option>
                <option value="computacion">Computación</option>
              </FormSelect>
              <Form.Control.Feedback type="invalid">{formErrors.categoria}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <FormLabel>Enlace/URL de la Imagen *</FormLabel>
              <FormInput 
                type="text" 
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.imagen}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                isInvalid={!!formErrors.imagen}
                disabled={actionLoading}
              />
              <Form.Control.Feedback type="invalid">{formErrors.imagen}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <FormLabel>Descripción del Producto *</FormLabel>
              <FormTextArea 
                as="textarea" 
                rows={3} 
                placeholder="Especificaciones, detalles del producto..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                isInvalid={!!formErrors.descripcion}
                disabled={actionLoading}
              />
              <Form.Control.Feedback type="invalid">{formErrors.descripcion}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Guardar Producto'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => !actionLoading && setShowConfirmModal(false)}
        centered
        contentClassName="bg-dark text-light border border-danger"
      >
        <Modal.Header closeButton closeVariant="white" className="border-danger">
          <Modal.Title className="text-danger font-display">Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>¿Estás seguro de que deseas eliminar este producto de forma permanente?</p>
          <div className="d-flex align-items-center gap-3 p-3 bg-dark-raw border border-secondary rounded mt-3">
            <Thumbnail src={productToDelete?.imagen} alt={productToDelete?.nombre} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'; }} />
            <div>
              <h6 className="m-0 text-white">{productToDelete?.nombre}</h6>
              <span className="text-secondary">{formatPrice(productToDelete?.precio || 0)}</span>
            </div>
          </div>
          <p className="text-danger mt-3" style={{ fontSize: '13px' }}>
            * Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-danger">
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" animation="border" /> : 'Eliminar Permanentemente'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </StyledContainer>
  );
};

export default AdminPanel;
