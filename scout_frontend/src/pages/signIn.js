import React, { useState } from 'react';
import BasicForm from '../components/basicForm/basicForm';
import { useNavigate } from 'react-router-dom';
import { HandleLogIn } from '../utils';
import { useSupabase } from '../supabaseContext'

const SignInPage = () => {
  const { login } = useSupabase();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSignIn = async (formData) => {
    const { email, password } = formData;
  
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
  
    const json = {
      email: email,
      password: password,
    };
  
    const success = await HandleLogIn(json, setError);
    if (success) {
      login(JSON.parse(localStorage.getItem('current_user')));
      navigate('/teams');
    }
  };

  const fields = [
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
  ];

  return (
    <div className="app-container">
      <div className="form-window">
        <h1>Iniciar sesión</h1>
        <BasicForm fields={fields} onSubmit={handleSignIn} />
        {error && <p style={{ color: 'red', maxWidth: '255px', textAlign: 'center', margin: 'auto', marginTop: '10px' }}>{error}</p>}
        <p>¿Todavía no estás registrado? <a href="/sign-up" className="link">Registrarse</a></p>
      </div>
    </div>
  );
};

export default SignInPage;
