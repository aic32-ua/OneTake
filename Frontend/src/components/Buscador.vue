<script>
import { IonIcon, IonRippleEffect } from '@ionic/vue';
import { ref,watch } from 'vue'
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
export default{
    components: {
        IonIcon,
        IonRippleEffect
    },
    emits: ['buscarUsuarios'],
    setup(props, { emit }){

        const usuarioLogeadoStore = useUsuarioLogeadoStore();

        const nombre = ref(null)

        const buscarUsuarios =  () => {
            if(nombre.value!=null && nombre.value.length > 0 ){
                emit("buscarUsuarios", nombre.value)
            }
        };

        watch(usuarioLogeadoStore, () => {
            nombre.value = null
        });

        return {nombre, buscarUsuarios}
    }
}
</script>

<template>
    <div class="container">
        <input type="text" placeholder="Nombre de usuario" v-model="nombre">
        <button class="ion-activatable" style="overflow: hidden; position: relative;" @click="buscarUsuarios">
            <ion-icon name="search-sharp"></ion-icon>
            <ion-ripple-effect></ion-ripple-effect>
        </button> 
    </div>
</template>

<style scoped>
ion-icon {
  font-size: 22px;
}
.container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 15px 30px 10px 30px;
}
button{
    background-color: rgba(188, 188, 188, 0.25);
    border-radius: 13px;
    padding: 10px;
    width: 40px;
    height: 40px;
}
input{
    border: transparent;
    border-radius: 13px;
    padding: 10px;
    outline: none;
    background-color: rgba(188, 188, 188, 0.25);
    font-size: 16px;
    height: 40px;
    width: 80%
}

input::placeholder {
  color: #BCBCBC;
}
</style>