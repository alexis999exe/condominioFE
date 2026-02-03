import { useState } from 'react';
import LoginPage        from './components/LoginPage';
import ContactList      from './components/ContactList';
import DepartmentChat   from './components/DepartmentChat';
import './App.css';

function App() {
  // ── autenticación ──
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken]             = useState(null);

  // ── chat (existente) ──
  const [selectedContact, setSelectedContact] = useState(null);

  // ── login ──
  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    console.log('✅ Login exitoso:', user);
  };

  // ── logout ──
  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setSelectedContact(null);
    console.log('👋 Logout');
  };

  // ── si no hay usuario, mostrar pantalla de login ──
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── pantalla principal (chat + notificaciones) ──
  return (
    <div className="app-container">
      <ContactList
        onSelectContact={setSelectedContact}
        selectedContact={selectedContact}
        currentUser={currentUser}
        onLogout={handleLogout}
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
