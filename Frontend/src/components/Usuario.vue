<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import { IonIcon, IonRippleEffect } from '@ionic/vue';
export default{
    props: ["nick", "video", "id", "tipoLista", "peticion" ,"idPeticion", "foto"],
    emits: ['mostrarPerfil', 'mostrarVideo', 'enviarPeticion', 'aceptarPeticion'],
    components:{
        IonIcon,
        IonRippleEffect
    },
    setup(props, { emit }) {
        const usuarioLogeadoStore = useUsuarioLogeadoStore();

        const mostrarVideo = () => {
            if(props.tipoLista=="home" && props.video){
                emit("mostrarVideo", props.id);
            }
            else{
                emit("mostrarPerfil", props.id);
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

        return { usuarioLogeadoStore, enviarPeticion, aceptarPeticion, mostrarPerfil, mostrarVideo};
    }
}

</script>

<template>
    <div class="container ion-activatable" @click="mostrarPerfil">
        <div class="usuario">
            <img :class="{ 'video-border': video && tipoLista=='home' }" alt="imagen" :src="foto ? 'http://localhost:3000/usuarios/' + id + '/foto': 'https://via.placeholder.com/65x65'" @click.stop="mostrarVideo">
            <p>{{nick}}</p>
        </div>
        <button v-if="tipoLista=='buscar' && !peticion" @click="enviarPeticion">Añadir amigo</button>
        <button v-if="tipoLista=='peticiones'" class="iconButton" @click="aceptarPeticion">
            <ion-icon name="checkmark-sharp"></ion-icon>
        </button>
        <ion-ripple-effect></ion-ripple-effect>
    </div>
</template>

<style scoped>
.usuario{
    display: flex;
    flex-direction: row;
}

p{
    cursor: pointer;
    font-size: 18px;
    align-content: center;
}

ion-icon{
    font-size: 22px;
}

.container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    width: 100vw;
}

img{
    height: 65px;
    width: 65px;
    border-radius: 35px;
    margin-right: 15px;
}

.iconButton{
    height: 38px;
    padding: 8px 8px;
}

button{
    height: 40px;
    border-radius: 13px;
    padding: 8px 12px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    background-color: rgba(0, 255, 25, 0.82);
}

.video-border {
    border: 2px solid rgba(0, 255, 25, 0.82);
    cursor: pointer;
}
</style>