import { useState } from 'react';
import NotificationBell from './NotificationBell';
import '../styles/ContactList.css';

// ── contactos de ejemplo (misma estructura que antes) ──
const contacts = [
  { id: 1, departmentId: 1, name: 'Juan Pérez',    apartment: 'Torre A – Depto 101', color: '#DC2626', lastMessage: 'Buenos días...', time: '10:30', unread: 2 },
  { id: 2, departmentId: 2, name: 'María García',  apartment: 'Torre A – Depto 201', color: '#7C3AED', lastMessage: '¿A qué hora...', time: '09:15', unread: 0 },
  { id: 3, departmentId: 3, name: 'Carlos López',  apartment: 'Torre B – Depto 102', color: '#2563EB', lastMessage: 'Perfecto...', time: 'Ayer',  unread: 1 },
  { id: 4, departmentId: 4, name: 'Ana Martínez',  apartment: 'Torre B – Depto 202', color: '#16A34A', lastMessage: 'Ok, entendido', time: 'Ayer',  unread: 0 },
  { id: 5, departmentId: 5, name: 'Pedro Sánchez', apartment: 'Torre A – Depto 301', color: '#EA580C', lastMessage: 'Gracias...', time: 'Lun',   unread: 0 },
  { id: 6, departmentId: 6, name: 'Laura Díaz',    apartment: 'Torre B – Depto 301', color: '#0891B2', lastMessage: 'Entendido.', time: 'Lun',   unread: 0 },
];

function ContactList({ onSelectContact, selectedContact, currentUser, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-sidebar">
      {/* ── header con usuario + campana ── */}
      <div className="contact-header">
        <div className="contact-header-top">
          {/* info del usuario logueado */}
          <div className="contact-user-info">
            <div className="contact-user-avatar">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-user-text">
              <span className="contact-user-name">{currentUser.name}</span>
              <span className="contact-user-role">
                {currentUser.role === 'admin' ? '⚙ Admin' : '🏠 Residente'}
              </span>
            </div>
          </div>

          {/* campana de notificaciones + logout */}
          <div className="contact-header-actions">
            <NotificationBell userId={currentUser.id} />
            <button className="contact-logout-btn" onClick={onLogout} title="Cerrar sesión">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* barra de búsqueda */}
        <div className="contact-search">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="contact-search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar departamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="contact-search-input"
          />
        </div>
      </div>

      {/* ── lista de contactos ── */}
      <div className="contact-list">
        {filteredContacts.length === 0 ? (
          <div className="contact-empty">
            <p>No se encontraron departamentos</p>
          </div>
        ) : (
          filteredContacts.map(contact => {
            const isSelected = selectedContact?.id === contact.id;
            return (
              <div
                key={contact.id}
                className={`contact-item ${isSelected ? 'contact-item-selected' : ''}`}
                onClick={() => onSelectContact(contact)}
              >
                <div className="contact-avatar" style={{ backgroundColor: contact.color }}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="contact-info">
                  <div className="contact-name-row">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-time">{contact.time}</span>
                  </div>
                  <div className="contact-preview-row">
                    <span className="contact-preview">{contact.lastMessage}</span>
                    {contact.unread > 0 && (
                      <span className="contact-unread">{contact.unread}</span>
                    )}
                  </div>
                  <span className="contact-apartment">{contact.apartment}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ContactList;
