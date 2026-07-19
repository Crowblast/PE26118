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
  FaRedo,
  FaTicketAlt,
  FaToggleOn,
  FaToggleOff,
  FaPercent
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

  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'cupones'
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal state for Products
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new product

  // Form Fields for Products
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    descripcion: '',
    imagen: '',
    stock: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirmation Modal state for Products
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form Modal state for Coupons
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form Fields for Coupons
  const [couponFormData, setCouponFormData] = useState({
    codigo: '',
    tipo: 'porcentaje',
    valor: '',
    compraMinima: '0',
    activo: true
  });
  const [couponFormErrors, setCouponFormErrors] = useState({});

  // Delete Confirmation Modal state for Coupons
  const [showConfirmCouponModal, setShowConfirmCouponModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  // Operations loading state (creating, editing, deleting)
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      if (isDemoMode) {
        const localData = localStorage.getItem('tecnomundo_db_products');
        if (localData) {
          setProducts(JSON.parse(localData));
        } else {
          const response = await fetch('/productos.json');
          if (!response.ok) throw new Error('Error al cargar datos demo');
          const data = await response.json();
          localStorage.setItem('tecnomundo_db_products', JSON.stringify(data));
          setProducts(data);
        }
      } else {
        if (!db) throw new Error('Firestore no está inicializado.');
        const colRef = collection(db, 'productos');
        const snapshot = await getDocs(colRef);
        let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
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

  // Fetch Coupons
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    setError('');
    try {
      if (isDemoMode) {
        const localData = localStorage.getItem('tecnomundo_db_coupons');
        if (localData) {
          setCoupons(JSON.parse(localData));
        } else {
          const defaultCoupons = [
            { id: '1', codigo: 'TECNO10', tipo: 'porcentaje', valor: 10, compraMinima: 0, activo: true },
            { id: '2', codigo: 'REGALO3000', tipo: 'fijo', valor: 3000, compraMinima: 15000, activo: true }
          ];
          localStorage.setItem('tecnomundo_db_coupons', JSON.stringify(defaultCoupons));
          setCoupons(defaultCoupons);
        }
      } else {
        if (!db) throw new Error('Firestore no está inicializado.');
        const colRef = collection(db, 'cupones');
        const snapshot = await getDocs(colRef);
        let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (list.length === 0) {
          const defaultCoupons = [
            { codigo: 'TECNO10', tipo: 'porcentaje', valor: 10, compraMinima: 0, activo: true },
            { codigo: 'REGALO3000', tipo: 'fijo', valor: 3000, compraMinima: 15000, activo: true }
          ];
          const seedPromises = defaultCoupons.map(async (cp) => {
            const newDoc = await addDoc(colRef, cp);
            return { id: newDoc.id, ...cp };
          });
          list = await Promise.all(seedPromises);
          console.log("Firestore Coupons seeded successfully!");
        }
        
        setCoupons(list);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener la lista de cupones: ' + err.message);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, [isDemoMode]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Error al cerrar sesión: ' + err.message);
    }
  };

  // Open product form modal for adding
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

  // Open product form modal for editing
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

  // Validate product form
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
        let updatedList = [...products];
        if (editingProduct) {
          updatedList = updatedList.map(p => 
            p.id === editingProduct.id ? { ...p, ...formattedProduct } : p
          );
          setSuccess('Producto actualizado con éxito (Local)');
        } else {
          const newProd = {
            id: Date.now(),
            ...formattedProduct
          };
          updatedList.push(newProd);
          setSuccess('Producto agregado con éxito (Local)');
        }
        localStorage.setItem('tecnomundo_db_products', JSON.stringify(updatedList));
        setProducts(updatedList);
        setShowFormModal(false);
      } else {
        const colRef = collection(db, 'productos');
        if (editingProduct) {
          const docRef = doc(db, 'productos', editingProduct.id);
          await updateDoc(docRef, formattedProduct);
          setSuccess('Producto actualizado correctamente en la nube.');
        } else {
          await addDoc(colRef, formattedProduct);
          setSuccess('Producto agregado correctamente a la nube.');
        }
        await fetchProducts();
        setShowFormModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete product confirmation modal
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

  // Open coupon modal for adding
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponFormData({
      codigo: '',
      tipo: 'porcentaje',
      valor: '',
      compraMinima: '0',
      activo: true
    });
    setCouponFormErrors({});
    setShowCouponModal(true);
  };

  // Open coupon modal for editing
  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      codigo: coupon.codigo,
      tipo: coupon.tipo,
      valor: coupon.valor.toString(),
      compraMinima: coupon.compraMinima.toString(),
      activo: coupon.activo
    });
    setCouponFormErrors({});
    setShowCouponModal(true);
  };

  // Validate Coupon Form
  const validateCouponForm = () => {
    const errors = {};
    if (!couponFormData.codigo.trim()) {
      errors.codigo = 'El código de cupón es obligatorio.';
    } else if (!/^[A-Z0-9_-]+$/i.test(couponFormData.codigo.trim())) {
      errors.codigo = 'El código debe contener solo letras, números y guiones, sin espacios.';
    }

    if (!couponFormData.valor) {
      errors.valor = 'El valor es obligatorio.';
    } else {
      const val = parseFloat(couponFormData.valor);
      if (isNaN(val) || val <= 0) {
        errors.valor = 'Debe ser un número mayor a 0.';
      } else if (couponFormData.tipo === 'porcentaje' && val > 100) {
        errors.valor = 'El porcentaje no puede ser mayor al 100%.';
      }
    }

    if (couponFormData.compraMinima !== '') {
      const min = parseFloat(couponFormData.compraMinima);
      if (isNaN(min) || min < 0) {
        errors.compraMinima = 'No puede ser negativo.';
      }
    }

    setCouponFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Coupon (Create or Edit)
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!validateCouponForm()) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    const formattedCoupon = {
      codigo: couponFormData.codigo.trim().toUpperCase(),
      tipo: couponFormData.tipo,
      valor: parseFloat(couponFormData.valor),
      compraMinima: couponFormData.compraMinima ? parseFloat(couponFormData.compraMinima) : 0,
      activo: couponFormData.activo
    };

    try {
      if (isDemoMode) {
        let updatedList = [...coupons];
        const isDuplicate = updatedList.some(c => 
          c.codigo === formattedCoupon.codigo && (!editingCoupon || c.id !== editingCoupon.id)
        );
        if (isDuplicate) {
          setCouponFormErrors({ codigo: 'Ya existe un cupón con este código.' });
          setActionLoading(false);
          return;
        }

        if (editingCoupon) {
          updatedList = updatedList.map(c => 
            c.id === editingCoupon.id ? { ...c, ...formattedCoupon } : c
          );
          setSuccess('Cupón actualizado con éxito (Local)');
        } else {
          const newCp = {
            id: Date.now().toString(),
            ...formattedCoupon
          };
          updatedList.push(newCp);
          setSuccess('Cupón agregado con éxito (Local)');
        }
        localStorage.setItem('tecnomundo_db_coupons', JSON.stringify(updatedList));
        setCoupons(updatedList);
        setShowCouponModal(false);
      } else {
        const colRef = collection(db, 'cupones');
        
        if (editingCoupon) {
          const docRef = doc(db, 'cupones', editingCoupon.id);
          await updateDoc(docRef, formattedCoupon);
          setSuccess('Cupón actualizado correctamente en la nube.');
        } else {
          const isDuplicate = coupons.some(c => c.codigo === formattedCoupon.codigo);
          if (isDuplicate) {
            setCouponFormErrors({ codigo: 'Ya existe un cupón con este código.' });
            setActionLoading(false);
            return;
          }
          await addDoc(colRef, formattedCoupon);
          setSuccess('Cupón creado correctamente en la nube.');
        }
        await fetchCoupons();
        setShowCouponModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar cupón: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Coupon Active Status
  const handleToggleCouponActive = async (coupon) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    const newStatus = !coupon.activo;

    try {
      if (isDemoMode) {
        const updatedList = coupons.map(c => 
          c.id === coupon.id ? { ...c, activo: newStatus } : c
        );
        localStorage.setItem('tecnomundo_db_coupons', JSON.stringify(updatedList));
        setCoupons(updatedList);
        setSuccess(`Cupón ${coupon.codigo} ${newStatus ? 'activado' : 'desactivado'} con éxito (Local).`);
      } else {
        const docRef = doc(db, 'cupones', coupon.id);
        await updateDoc(docRef, { activo: newStatus });
        setSuccess(`Cupón ${coupon.codigo} ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      setError('Error al cambiar estado del cupón: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete coupon confirmation
  const handleOpenDeleteCoupon = (coupon) => {
    setCouponToDelete(coupon);
    setShowConfirmCouponModal(true);
  };

  // Confirm Delete Coupon
  const handleConfirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isDemoMode) {
        const updatedList = coupons.filter(c => c.id !== couponToDelete.id);
        localStorage.setItem('tecnomundo_db_coupons', JSON.stringify(updatedList));
        setCoupons(updatedList);
        setSuccess('Cupón eliminado con éxito (Local).');
      } else {
        const docRef = doc(db, 'cupones', couponToDelete.id);
        await deleteDoc(docRef);
        setSuccess('Cupón eliminado correctamente de la nube.');
        await fetchCoupons();
      }
      setShowConfirmCouponModal(false);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar cupón: ' + err.message);
    } finally {
      setActionLoading(false);
      setCouponToDelete(null);
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
        <meta name="description" content="Gestiona el catálogo de productos y cupones de Tecno Mundo." />
      </Helmet>

      <AdminHeader>
        <div>
          <span className="hero-subtitle d-flex align-items-center gap-2">
            <FaTools size={14} /> Panel Administrativo
          </span>
          <h2 className="m-0 font-display">
            {activeTab === 'productos' ? 'Gestión de Inventario' : 'Gestión de Cupones'}
          </h2>
          <small className="text-secondary">
            Conectado como: <strong>{currentUser?.email}</strong> {isDemoMode && <span className="badge bg-warning text-dark ms-2">Modo Demo</span>}
          </small>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="btn-group me-2" role="group" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-sm)', padding: '3px' }}>
            <button 
              type="button" 
              className={`btn btn-sm ${activeTab === 'productos' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveTab('productos')}
              style={{ borderRadius: 'var(--border-radius-sm)', border: 'none' }}
            >
              <FaShoppingBag className="me-1" size={13} /> Productos
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${activeTab === 'cupones' ? 'btn-primary' : 'btn-link text-white text-decoration-none'}`}
              onClick={() => setActiveTab('cupones')}
              style={{ borderRadius: 'var(--border-radius-sm)', border: 'none' }}
            >
              <FaTicketAlt className="me-1" size={13} /> Cupones
            </button>
          </div>

          <ControlButton 
            variant="secondary" 
            onClick={activeTab === 'productos' ? fetchProducts : fetchCoupons} 
            disabled={loading || couponsLoading} 
            title="Sincronizar base de datos"
          >
            <FaRedo className={(activeTab === 'productos' ? loading : couponsLoading) ? 'spin-anim' : ''} />
            <span>Actualizar</span>
          </ControlButton>

          <ControlButton 
            variant="primary" 
            onClick={activeTab === 'productos' ? handleOpenAdd : handleOpenAddCoupon}
          >
            <FaPlus />
            <span>{activeTab === 'productos' ? 'Nuevo Producto' : 'Nuevo Cupón'}</span>
          </ControlButton>

          <ControlButton variant="danger" onClick={handleLogout} className="btn-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ff8a8a' }}>
            <FaSignOutAlt />
            <span>Salir</span>
          </ControlButton>
        </div>
      </AdminHeader>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'productos' && (
        <>
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
        </>
      )}

      {/* COUPONS TAB CONTENT */}
      {activeTab === 'cupones' && (
        <>
          {couponsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="info" className="mb-3" />
              <p className="text-secondary font-display">Cargando cupones de descuento...</p>
            </div>
          ) : (
            <GlassTableCard>
              {coupons.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <FaTicketAlt size={48} className="mb-3" style={{ opacity: 0.5 }} />
                  <h4>No hay cupones registrados</h4>
                  <p>Haz clic en "Nuevo Cupón" para crear uno.</p>
                </div>
              ) : (
                <DarkTable responsive hover>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Compra Mínima</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((cp) => (
                      <tr key={cp.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                          {cp.codigo}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className="badge bg-dark border border-secondary text-light px-2 py-1">
                            {cp.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {cp.tipo === 'porcentaje' ? `${cp.valor}%` : formatPrice(cp.valor)}
                        </td>
                        <td>
                          {cp.compraMinima > 0 ? formatPrice(cp.compraMinima) : 'Sin mínimo'}
                        </td>
                        <td>
                          <Button 
                            variant="link" 
                            className="p-0 border-0 text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleToggleCouponActive(cp)}
                            style={{ color: cp.activo ? 'var(--success)' : 'var(--text-muted)' }}
                            title={cp.activo ? 'Desactivar cupón' : 'Activar cupón'}
                          >
                            {cp.activo ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                            <span style={{ fontSize: '13px' }}>{cp.activo ? 'Activo' : 'Inactivo'}</span>
                          </Button>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="d-inline-flex align-items-center gap-1"
                              onClick={() => handleOpenEditCoupon(cp)}
                            >
                              <FaEdit size={13} />
                              <span>Editar</span>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="d-inline-flex align-items-center gap-1"
                              onClick={() => handleOpenDeleteCoupon(cp)}
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
        </>
      )}

      {/* CREATE & EDIT PRODUCT MODAL */}
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

      {/* CREATE & EDIT COUPON MODAL */}
      <Modal 
        show={showCouponModal} 
        onHide={() => !actionLoading && setShowCouponModal(false)}
        backdrop="static" 
        centered
        contentClassName="bg-dark text-light border border-secondary"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="gradient-text font-display">
            {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCoupon}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <FormLabel>Código del Cupón *</FormLabel>
              <FormInput 
                type="text" 
                placeholder="Ej. TECNO2026"
                value={couponFormData.codigo}
                onChange={(e) => setCouponFormData({ ...couponFormData, codigo: e.target.value })}
                isInvalid={!!couponFormErrors.codigo}
                disabled={actionLoading}
                style={{ textTransform: 'uppercase' }}
              />
              <Form.Control.Feedback type="invalid">{couponFormErrors.codigo}</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Solo letras, números y guiones. Se convertirá automáticamente a mayúsculas.
              </Form.Text>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <FormLabel>Tipo de Descuento *</FormLabel>
                  <FormSelect
                    value={couponFormData.tipo}
                    onChange={(e) => setCouponFormData({ ...couponFormData, tipo: e.target.value })}
                    disabled={actionLoading}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto Fijo ($)</option>
                  </FormSelect>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <FormLabel>
                    {couponFormData.tipo === 'porcentaje' ? 'Porcentaje (%) *' : 'Monto Fijo (ARS) *'}
                  </FormLabel>
                  <FormInput 
                    type="number" 
                    placeholder={couponFormData.tipo === 'porcentaje' ? '15' : '2000'}
                    min="0.01"
                    step="any"
                    value={couponFormData.valor}
                    onChange={(e) => setCouponFormData({ ...couponFormData, valor: e.target.value })}
                    isInvalid={!!couponFormErrors.valor}
                    disabled={actionLoading}
                  />
                  <Form.Control.Feedback type="invalid">{couponFormErrors.valor}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <FormLabel>Compra Mínima Requerida (ARS)</FormLabel>
              <FormInput 
                type="number" 
                placeholder="0 (Sin compra mínima)"
                min="0"
                step="any"
                value={couponFormData.compraMinima}
                onChange={(e) => setCouponFormData({ ...couponFormData, compraMinima: e.target.value })}
                isInvalid={!!couponFormErrors.compraMinima}
                disabled={actionLoading}
              />
              <Form.Control.Feedback type="invalid">{couponFormErrors.compraMinima}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="coupon-active-switch"
                label="Cupón Activo"
                checked={couponFormData.activo}
                onChange={(e) => setCouponFormData({ ...couponFormData, activo: e.target.checked })}
                disabled={actionLoading}
                className="text-white font-weight-bold"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={() => setShowCouponModal(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" animation="border" /> : 'Guardar Cupón'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* CONFIRM DELETE PRODUCT MODAL */}
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

      {/* CONFIRM DELETE COUPON MODAL */}
      <Modal 
        show={showConfirmCouponModal} 
        onHide={() => !actionLoading && setShowConfirmCouponModal(false)}
        centered
        contentClassName="bg-dark text-light border border-danger"
      >
        <Modal.Header closeButton closeVariant="white" className="border-danger">
          <Modal.Title className="text-danger font-display">Confirmar Eliminación de Cupón</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>¿Estás seguro de que deseas eliminar este cupón de descuento?</p>
          <div className="p-3 bg-dark-raw border border-secondary rounded mt-3">
            <h6 className="m-0 text-white">Código: {couponToDelete?.codigo}</h6>
            <span className="text-secondary">
              Descuento: {couponToDelete?.tipo === 'porcentaje' ? `${couponToDelete?.valor}%` : formatPrice(couponToDelete?.valor || 0)}
            </span>
          </div>
          <p className="text-danger mt-3" style={{ fontSize: '13px' }}>
            * Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-danger">
          <Button variant="secondary" onClick={() => setShowConfirmCouponModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteCoupon} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" animation="border" /> : 'Eliminar Cupón'}
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
