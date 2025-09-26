import AppRouter from './rutas/approuter';
import React, { useState, useEffect} from 'react';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get('users/me/');
        setUser(res.data);
      } catch (err) {
        console.info('No hay sesión activa o token inválido.');
      }
    };
    loadMe();
  }, []);
  
  return <AppRouter />;
}

export default App;