import { API_URL, HandleLogIn } from '../utils';
import React, { useState } from 'react';
import BasicForm from '../components/basicForm/basicForm';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../supabaseContext';

const SignUpPage = () => {
  const { login } = useSupabase();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  const handleSignUp = async (formData) => {
    const { username, email, password, confirm_password } = formData;

    if (password !== confirm_password) {
      setError('Las contraseñas no coinciden');
      return
    }

    const json = {
      email: email,
      name: username,
      password: password,
    };

    try {
      const registerReponse = await fetch(`${API_URL}/users` , {
        method: 'POST',
        body: JSON.stringify(json),
        headers: {
          'Content-Type': 'application/json',
        },

      });

      if (!registerReponse.ok) {
        switch (registerReponse.status) {
          case 409:
            throw new Error('El email ya está en uso');
          case 500:
            throw new Error('Servidor no disponible\nIntente nuvamente más tarde');
          default:
            throw new Error('Error registrando usuario');
        }
      } else {
        await registerReponse.json();
        const json = {
          email: email,
          password: password,
        };
    
        const success = await HandleLogIn(json, setError);
        if (success) {
          login(JSON.parse(localStorage.getItem('current_user')));
          navigate('/teams');
        }
      }

    } catch (error) {
      setError(error.message);
    } 
  };

  const fields = [
    { name: 'username', label: 'Nombre de usuario', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    { name: 'confirm_password', label: 'Confirmar contraseña', type: 'password', required: true },
  ];

  return (
    <div className="app-container">
      <div className="form-window">
        <h1>Registrarse</h1>
        <BasicForm fields={fields} onSubmit={handleSignUp} />
        {error && <p style={{ fontSize: '20px', color: 'red', maxWidth: '255px', textAlign: 'center', margin: 'auto', marginTop: '10px' }}>{error}</p>}
        <p>Ya estás registrado? <a href="/sign-in" className="link">Iniciar sesión</a></p>
      </div>
    </div>
  );
};

export default SignUpPage;
