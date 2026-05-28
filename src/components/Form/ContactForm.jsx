import React, { useState } from 'react';
import { Mail, CheckCircle2, MessageSquare, User, HelpCircle } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: 'consulta',
    mensaje: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    // Simulate API request
    console.log('Datos enviados:', formData);
    setSubmitted(true);
    // Reset form after submission
    setFormData({
      nombre: '',
      email: '',
      asunto: 'consulta',
      mensaje: ''
    });
  };

  return (
    <section className="form-section container">
      <div className="form-grid">
        <div className="form-info">
          <span className="hero-subtitle">Contacto</span>
          <h3>¿Tienes alguna consulta?</h3>
          <p>
            Escríbenos y uno de nuestros expertos en soporte técnico o ventas se pondrá en contacto contigo en menos de 24 horas. ¡Queremos ayudarte a armar tu setup ideal!
          </p>
          
          <div className="form-info-items">
            <div className="form-info-item">
              <div className="form-info-icon">
                <Mail size={20} />
              </div>
              <div className="form-info-content">
                <h5>Email de Soporte</h5>
                <p>soporte@tecnomundo.com</p>
              </div>
            </div>
            
            <div className="form-info-item">
              <div className="form-info-icon">
                <MessageSquare size={20} />
              </div>
              <div className="form-info-content">
                <h5>Atención Comercial</h5>
                <p>ventas@tecnomundo.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card form-card">
          {submitted ? (
            <div className="form-success-alert">
              <h4>
                <CheckCircle2 className="success-icon" size={24} />
                ¡Mensaje Enviado!
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Gracias por comunicarte con Tecno Mundo. Hemos recibido tu consulta y te responderemos a la brevedad.
              </p>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '20px' }}
                onClick={() => setSubmitted(false)}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="asunto">Motivo de Consulta</label>
                <select
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="consulta">Consulta General</option>
                  <option value="soporte">Soporte Técnico / Garantía</option>
                  <option value="presupuesto">Presupuestos / Compras Mayoristas</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje *</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  className="form-control"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Enviar Mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
