import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Cpu, Award } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-subtitle">Bienvenido a Tecno Mundo</span>
            <h1 className="hero-title">
              Equípate con la tecnología de <span className="gradient-text">Última Generación</span>
            </h1>
            <p className="hero-description">
              Descubre nuestra selección curada de periféricos de alta gama y wearables diseñados para llevar tu productividad y rendimiento gaming al siguiente nivel.
            </p>
            <div className="hero-buttons">
              <Link to="/productos" className="btn btn-primary">
                Ver Catálogo
                <ArrowRight size={18} />
              </Link>
              <a href="#beneficios" className="btn btn-secondary">
                Saber Más
              </a>
            </div>
          </div>
          
          <div className="hero-image-container">
            <div className="hero-image-glow"></div>
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80" 
              alt="Setup Gamer" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="hero-subtitle">¿Por qué elegirnos?</span>
            <h2 style={{ fontSize: '32px', marginTop: '12px' }}>Garantía y Confianza en cada compra</h2>
          </div>
          
          <div className="grid-container grid-cols-3">
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--accent-primary)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                <Zap size={24} />
              </div>
              <h4 style={{ fontSize: '20px' }}>Envíos Instantáneos</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Despachamos tu pedido en el acto. Recibe en menos de 24 horas en CABA y GBA, y envíos a todo el país por correo prioritario.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--accent-secondary)', border: '1px solid rgba(155, 81, 224, 0.2)' }}>
                <Shield size={24} />
              </div>
              <h4 style={{ fontSize: '20px' }}>Compra Protegida</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Todos nuestros productos tecnológicos cuentan con garantía escrita oficial de 12 meses y cambios directos por falla de fábrica.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--accent-primary)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                <Award size={24} />
              </div>
              <h4 style={{ fontSize: '20px' }}>Soporte Dedicado</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                ¿Tienes dudas para instalar tu periférico? Contáctanos y nuestro equipo especializado te asistirá de forma remota paso a paso.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
