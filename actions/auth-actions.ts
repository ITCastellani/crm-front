import api from '@/lib/axios';
import Cookies from 'js-cookie';

export const loginUser = async (credentials: any) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    // Asumimos que la API devuelve { user: { name: '...' }, token: '...' }
    Cookies.set('token', data.token, { expires: 7, secure: true, sameSite: 'strict' });
    return data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Error al iniciar sesión';
  }
};

export const registerUser = async (userData: any) => {
  try {
    const { data } = await api.post('/register', userData);
    return data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Error en el registro';
  }
};





