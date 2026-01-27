import { useState, useEffect, useRef } from 'react';
import echo from '../plugins/echo';
import api from '../plugins/axios';
import '../styles/DepartmentChat.css';

function DepartmentChat({ 
  contact,
  currentUserId, 
  currentUserName 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  if (!contact) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-content">
          <h3>Selecciona un contacto</h3>
          <p>Elige un departamento de la lista para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadMessages = async (departmentId) => {
    setLoading(true);
    try {
      console.log('📥 Cargando mensajes del departamento:', departmentId);
      const response = await api.get('/chat/messages', {
        params: { department_id: departmentId }
      });
      console.log('✅ Mensajes cargados:', response.data);
      setMessages(response.data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      console.error('Error details:', error.response?.data);
      
      // Si falla, mostrar mensajes de ejemplo para ese departamento
      const exampleMessages = getExampleMessages(departmentId);
      setMessages(exampleMessages);
    } finally {
      setLoading(false);
    }
  };

  // Mensajes de ejemplo para visualización (diferentes por departamento)
  const getExampleMessages = (departmentId) => {
    const baseMessages = {
      1: [
        { id: 1, user_id: 2, user_name: 'Juan Pérez', message: 'Hola, buenos días', created_at: '2026-01-27T09:10:00' },
        { id: 2, user_id: 999, user_name: 'Admin Sistema', message: 'Buenos días, ¿en qué puedo ayudarte?', created_at: '2026-01-27T09:11:00' },
      ],
      2: [
        { id: 3, user_id: 3, user_name: 'María García', message: '¿A qué hora es la reunión?', created_at: '2026-01-27T09:15:00' },
        { id: 4, user_id: 999, user_name: 'Admin Sistema', message: 'La reunión es a las 18:00', created_at: '2026-01-27T09:16:00' },
      ],
      3: [
        { id: 5, user_id: 4, user_name: 'Carlos López', message: 'Perfecto, nos vemos entonces', created_at: '2026-01-27T08:45:00' },
        { id: 6, user_id: 999, user_name: 'Admin Sistema', message: 'Claro, hasta luego', created_at: '2026-01-27T08:46:00' },
      ],
      4: [
        { id: 7, user_id: 5, user_name: 'Ana Martínez', message: 'Ok, entendido', created_at: '2026-01-26T10:30:00' },
      ],
    };

    return baseMessages[departmentId] || [];
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageData = {
      message: newMessage,
      department_id: contact.departmentId,
      user_id: currentUserId,
      user_name: currentUserName
    };

    setSending(true);
    const tempMessage = {
      id: Date.now(),
      user_id: currentUserId,
      user_name: currentUserName,
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    try {
      console.log('📤 Enviando mensaje:', messageData);
      const response = await api.post('/chat/messages', messageData);
      console.log('✅ Mensaje enviado:', response.data);
      
      // Reemplazar el mensaje temporal con el real
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMessage.id);
        return [...filtered, response.data.message];
      });
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data);
      
      // Agregar el mensaje localmente para visualización
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      
      alert('Error al enviar el mensaje. Verifica que el backend esté corriendo.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // IMPORTANTE: Este useEffect se ejecuta cada vez que cambia el contacto
  useEffect(() => {
    if (!contact) return;

    console.log('🔄 Contacto cambiado a:', contact.name, 'Departamento:', contact.departmentId);
    
    // Limpiar mensajes anteriores
    setMessages([]);
    setIsConnected(false);
    
    // Cargar mensajes del nuevo departamento
    loadMessages(contact.departmentId);

    // Desconectar del canal anterior y conectar al nuevo
    const channelName = `department.${contact.departmentId}`;
    
    try {
      const channel = echo.channel(channelName);
      
      channel
        .listen('.message.sent', (e) => {
          console.log('📨 Mensaje recibido en tiempo real:', e);
          setMessages(prev => [...prev, e]);
          setTimeout(scrollToBottom, 100);
        })
        .subscribed(() => {
          console.log('✅ Conectado al canal:', channelName);
          setIsConnected(true);
        })
        .error((error) => {
          console.error('❌ Error en el canal:', error);
          setIsConnected(false);
        });

      return () => {
        console.log('👋 Desconectando del canal:', channelName);
        echo.leave(channelName);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      setIsConnected(false);
    }
  }, [contact]); // ← CLAVE: Se ejecuta cuando cambia contact

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-main">
      <div className="chat-header-main">
        <div className="chat-contact-info">
          <div className="chat-avatar" style={{ backgroundColor: contact.color }}>
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong className="chat-contact-name">{contact.name}</strong>
            <div className="chat-contact-apartment">{contact.apartment}</div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="icon-btn" title="Llamar">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
          <button className="icon-btn" title="Videollamada">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
          <button className="icon-btn" title="Más opciones">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="messages-container-main" ref={messagesContainerRef}>
        {loading ? (
          <div className="empty-state-main">
            <p>Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state-main">
            <p>No hay mensajes aún</p>
            <span>Envía el primer mensaje a {contact.name}</span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.user_id === currentUserId;
            const showDate = index === 0 || 
              new Date(messages[index - 1].created_at).toDateString() !== 
              new Date(msg.created_at).toDateString();

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="date-divider">
                    <span>{new Date(msg.created_at).toLocaleDateString('es-MX', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                )}
                <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && (
                    <div className="message-sender">{msg.user_name}</div>
                  )}
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">{formatTime(msg.created_at)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="input-container-main">
        <button className="icon-btn-input" title="Adjuntar">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
        <button className="icon-btn-input" title="Emoji">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </button>
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          disabled={sending}
          maxLength={1000}
          className="message-input"
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          className="send-btn"
          title="Enviar"
        >
          {sending ? (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="spinner">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          ) : (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default DepartmentChat;