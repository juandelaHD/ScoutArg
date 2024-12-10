export const API_URL = process.env.REACT_APP_API_URL;
export const ADMIN_ID = process.env.REACT_APP_ADMIN_ID;

const getUser = async () => {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    const response = await fetch(`${API_URL}/users/${currentUser.id}`)
    if (!response.ok) {
        throw new Error('Error al obtener el usuario');
    }
    const user = await response.json();

    localStorage.setItem('current_user_data', JSON.stringify(user));
}

export const HandleLogIn = async (json, setError) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify(json),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const access_token = await response.json();
  
      localStorage.setItem('current_user', JSON.stringify(access_token));
      await getUser();
      return true; 
    } catch (error) {
      setError('Usuario o contraseña incorrectos');
      return false; 
    }
  };
  