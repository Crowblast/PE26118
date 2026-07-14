import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { FaLock, FaEnvelope, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const StyledCard = styled.div`
  background: rgba(20, 22, 31, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 480px;
  width: 100%;
  margin: 40px auto;
  transition: var(--transition-normal);

  &:hover {
    border-color: rgba(var(--accent-primary-rgb), 0.3);
    box-shadow: 0 12px 40px 0 rgba(var(--accent-primary-rgb), 0.08);
  }
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  font-size: 15px;
  transition: var(--transition-fast);
  outline: none;

  &:focus {
    border-color: var(--accent-primary);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
  }
`;

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
`;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!email) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      setSuccess('Cuenta creada con éxito. Iniciando sesión...');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es muy débil.');
      } else {
        setError(err.message || 'Error al crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 animate-fade-in">
      <Helmet>
        <title>Crear Cuenta - Tecno Mundo</title>
        <meta name="description" content="Regístrate en Tecno Mundo para comenzar a gestionar el catálogo de productos tecnológicos en la plataforma." />
      </Helmet>

      <Row className="justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Col xs={12}>
          <StyledCard>
            <div className="text-center mb-4">
              <h2 className="gradient-text font-display mb-2" style={{ fontSize: '28px' }}>Crear Cuenta</h2>
              <p className="text-secondary" style={{ fontSize: '14px' }}>
                Completa el formulario para registrarte
              </p>
            </div>

            {isDemoMode && (
              <Alert variant="info" className="mb-4 d-flex align-items-center gap-2" style={{ background: 'rgba(0, 242, 254, 0.05)', borderColor: 'rgba(0, 242, 254, 0.2)', color: 'var(--accent-primary)', fontSize: '13px' }}>
                <FaInfoCircle size={18} />
                <span>
                  <strong>Modo Demo Activo:</strong> Puedes registrar cualquier cuenta de prueba localmente.
                </span>
              </Alert>
            )}

            {error && <Alert variant="danger" className="mb-4" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ff8a8a', fontSize: '14px' }}>{error}</Alert>}
            {success && <Alert variant="success" className="mb-4" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#74f2ca', fontSize: '14px' }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <StyledLabel htmlFor="email">Correo Electrónico</StyledLabel>
                <InputGroup>
                  <InputIcon>
                    <FaEnvelope />
                  </InputIcon>
                  <StyledInput
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </InputGroup>
              </div>

              <div className="mb-3">
                <StyledLabel htmlFor="password">Contraseña</StyledLabel>
                <InputGroup>
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                  <StyledInput
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </InputGroup>
              </div>

              <div className="mb-4">
                <StyledLabel htmlFor="confirmPassword">Confirmar Contraseña</StyledLabel>
                <InputGroup>
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                  <StyledInput
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita su contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </InputGroup>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                style={{ height: '48px' }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" animation="border" role="status" />
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Registrarse</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>
                Inicia sesión aquí
              </Link>
            </div>
          </StyledCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
