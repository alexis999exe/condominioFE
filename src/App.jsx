import { useState } from 'react';
import ContactList from './components/ContactList';
import DepartmentChat from './components/DepartmentChat';
import './App.css';

function App() {
  // Datos de ejemplo
  const [contacts] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      apartment: 'Apto 301',
      departmentId: 1,
      color: '#DC2626',
      lastMessage: 'Gracias por la información',
      lastMessageTime: '09:10',
      unreadCount: 0,
    },
    {
      id: 2,
      name: 'María García',
      apartment: 'Apto 205',
      departmentId: 2,
      color: '#DC2626',
      lastMessage: '¿A qué hora es la reunión?',
      lastMessageTime: '09:15',
      unreadCount: 2,
    },
    {
      id: 3,
      name: 'Carlos López',
      apartment: 'Apto 102',
      departmentId: 3,
      color: '#B91C1B',
      lastMessage: 'Perfecto, nos vemos entonces',
      lastMessageTime: '08:45',
      unreadCount: 0,
    },
    {
      id: 4,
      name: 'Ana Martínez',
      apartment: 'Apto 408',
      departmentId: 4,
      color: '#991B1B',
      lastMessage: 'Ok, entendido',
      lastMessageTime: 'Ayer',
      unreadCount: 0,
    },
  ]);

  const [selectedContact, setSelectedContact] = useState(contacts[1]); // Selecciona María por defecto

  const currentUser = {
    id: 1,  // ← Cambia de 999 a 1 (o el ID que tengas)
    name: 'Administrador',  // ← Cambia el nombre también
  };
  return (
    <div className="app-container">
      <ContactList 
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />
      <DepartmentChat 
        contact={selectedContact}
        currentUserId={currentUser.id}
        currentUserName={currentUser.name}
      />
    </div>
  );
}

export default App;