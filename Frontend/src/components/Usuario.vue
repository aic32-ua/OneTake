<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
export default{
    props: ["nick", "video", "id", "tipoLista", "peticion" ,"idPeticion", "foto"],
    emits: ['mostrarPerfil', 'mostrarVideo', 'enviarPeticion', 'aceptarPeticion', 'rechazarPeticion'],
    setup(props, { emit }) {
        const usuarioLogeadoStore = useUsuarioLogeadoStore();

        const mostrarVideo = () => {
            if(props.video){
                emit("mostrarVideo", props.id);
            }
        };
        const mostrarPerfil = () => {
            emit("mostrarPerfil", props.id);
        };
        const enviarPeticion = () => {
            emit("enviarPeticion", props.id);
        };
        const aceptarPeticion = () => {
            emit("aceptarPeticion", props.idPeticion);
        };
        const rechazarPeticion = () => {
            emit("rechazarPeticion", props.idPeticion);
        };

        return { usuarioLogeadoStore, enviarPeticion, aceptarPeticion, rechazarPeticion, mostrarPerfil, mostrarVideo};
    }
}

</script>

<template>
    
    <li :id="id">
        <div class="container">
            <div class="usuario">
                <img :class="{ 'video-border': video }" alt="imagen" :src="foto ? 'http://localhost:3000/usuarios/' + id + '/foto': 'https://via.placeholder.com/65x65'" @click="mostrarVideo">
                <p @click="mostrarPerfil">{{nick}}</p>
            </div>
            <button class="aceptar-button" v-if="tipoLista=='buscar' && !peticion" @click="enviarPeticion">Añadir amigo</button>
            <div v-if="tipoLista=='peticiones'" class="contenedorBotones">
                <button class="aceptar-button"  @click="aceptarPeticion">Aceptar</button>
                <button class="rechazar-button" @click="rechazarPeticion">Rechazar</button>
            </div>
        </div>
    </li>
    
</template>

<style scoped>
.usuario{
    display: flex;
    flex-direction: row;
}

p{
    cursor: pointer;
    font-size: 20px;
}

.container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-right: 15px;
    height: 80px
}

.contenedorBotones{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 50%;
}

img{
    height: 65px;
    width: 65px;
    border-radius: 35px;
    margin-right: 15px;
}

button{
    height: 40px;
    border-radius: 13px;
    padding: 8px 12px;
    color: white;
    cursor: pointer;
    font-size: 12px;
}

.aceptar-button {
  background-color: rgba(0, 255, 25, 0.82);
}

.rechazar-button {
    background-color: rgba(255, 0, 0, 0.75);
}

.video-border {
    border: 2px solid rgba(0, 255, 25, 0.82);
    cursor: pointer;
}
</style>