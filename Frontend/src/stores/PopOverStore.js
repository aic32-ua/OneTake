import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePopOverStore  = defineStore('PopOverStore', () => {
  const abierto = ref(false)
      
  const abrirPopOver = () => {
    abierto.value = true;
  };

  const cerrarPopOver = () => {
    abierto.value = false;
  }
  
  return { abierto, abrirPopOver, cerrarPopOver }

});