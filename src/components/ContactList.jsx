import { useState } from 'react';
import '../styles/ContactList.css';

function ContactList({ contacts, selectedContact, onSelectContact }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.apartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h2>Chat</h2>
        <p>Comunícate con los residentes</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar contacto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="contacts-scroll">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
            onClick={() => onSelectContact(contact)}
          >
            <div className="contact-avatar" style={{ backgroundColor: contact.color }}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-info">
              <div className="contact-header">
                <strong className="contact-name">{contact.name}</strong>
                {contact.lastMessageTime && (
                  <span className="contact-time">{contact.lastMessageTime}</span>
                )}
              </div>
              <div className="contact-details">
                <span className="contact-apartment">{contact.apartment}</span>
              </div>
              {contact.lastMessage && (
                <p className="contact-last-message">{contact.lastMessage}</p>
              )}
            </div>
            {contact.unreadCount > 0 && (
              <div className="unread-badge">{contact.unreadCount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactList;