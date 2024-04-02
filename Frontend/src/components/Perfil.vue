<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import { ref } from 'vue'
import { useRouter } from 'vue-router';

export default{
    setup(){
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();
        const router = useRouter()

        const usuario = ref({})

        const obtenerUsuario = async () => {
            usuario.value = await api.obtenerInformacionUsuario(usuarioLogeadoStore.idUsu);
        };

        obtenerUsuario();

        const cerrarSesion = () => {
            usuarioLogeadoStore.cerrarSesion();
            router.push({path: 'login'});
        }

        return { usuario , cerrarSesion};
    }
}
</script>

<template>
    
    <div class="container">
        <div class="header">
            <img alt="imagen" :src="usuario.foto ? 'http://localhost:3000/usuarios/' + usuario.id + '/fotoPerfil': 'https://via.placeholder.com/150x150'">
            <div class="buttons">
                <button class="ok-button">Modificar foto</button>
                <button class="warning-button">Actualizar datos</button>
                <button class="wrong-button">Borrar cuenta</button>
            </div>
        </div>
        <p>{{usuario.nick}}</p>
        <p>{{usuario.email}}</p>
        <button class="wrong-button" @click="cerrarSesion">Cerrar sesion</button>
    </div>
    
</template>

<style scoped>
.container{
    padding: 20px;
    display: flex;
    flex-direction: column;
}

p{
    margin-top: 0px;
    margin-bottom: 20;
    font-weight: 800;
}

.header{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 150px;
    margin-bottom: 20px;
}

.buttons{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

button{
    height: 40px;
    border-radius: 13px;
    padding: 8px 12px;
    color: white;
    cursor: pointer;
    font-size: 12px;
}

.ok-button {
  background-color: rgba(0, 255, 25, 0.82);
}

.warning-button {
    background-color: rgba(255, 138, 0, 0.75);
}

.wrong-button {
    background-color: rgba(255, 0, 0, 0.75);
}
</style>