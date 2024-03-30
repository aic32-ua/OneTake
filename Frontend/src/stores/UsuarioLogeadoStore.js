import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsuarioLogeadoStore  = defineStore('UsuarioLogeadoStore', () => {
  const token = ref(null)
  const idUsu = ref(null)

  if (localStorage.getItem('token')) {
    token.value = localStorage.getItem('token');
  }
  if (localStorage.getItem('idUsu')) {
    idUsu.value = localStorage.getItem('idUsu');
  }
      
  const iniciarSesion = ({ newToken, newId }) => {
    token.value = newToken;
    idUsu.value = newId;
    localStorage.setItem('token', newToken);
    localStorage.setItem('idUsu', newId);
  };

  const cerrarSesion = () => {
    token.value = null;
    idUsu.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('idUsu');
  }
  
  return { token, idUsu, iniciarSesion, cerrarSesion }

});