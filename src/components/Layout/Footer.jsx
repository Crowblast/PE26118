import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
  const team = [
    {
      name: 'Mateo Silvestre',
      role: 'CEO & Fundador',
      initials: 'MS',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Lucía Fernández',
      role: 'Desarrolladora Lead',
      initials: 'LF',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Santiago Ramos',
      role: 'Soporte y Ventas',
      initials: 'SR',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="logo">
              <Cpu className="logo-icon" size={24} />
              <span>TECNO <span className="gradient-text">MUNDO</span></span>
            </h3>
            <p>
              Tu portal hacia la tecnología del futuro. Ofrecemos los mejores componentes, periféricos y soporte especializado para potenciar tu experiencia digital.
            </p>
          </div>
          
          <div className="footer-team-section">
            <h4>Nuestro Equipo</h4>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-avatar-container">
                    <div className="team-avatar">
                      {member.initials}
                    </div>
                  </div>
                  <h5>{member.name}</h5>
                  <p>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Tecno Mundo S.A. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
