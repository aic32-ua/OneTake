<script>
import { IonAlert, IonPopover, IonContent, IonHeader, IonModal, IonToolbar, IonButton, IonButtons, IonIcon } from '@ionic/vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import FotoUpload from './FotoUpload.vue'
import actualizarDatos from './ActualizarDatos.vue'
import { ref,watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import ActualizarDatos from './ActualizarDatos.vue';

export default{
    components: {
        IonAlert,
        IonPopover,
        IonContent,
        IonHeader,
        IonModal,
        IonToolbar,
        IonButton,
        IonButtons,
        IonIcon,
        FotoUpload,
        ActualizarDatos
    },
    props: ["id"],
    emits: ['borrarAmigo'],
    setup(props, { emit }){
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();
        const route = useRoute()
        const router = useRouter()

        const botonesAlerta = [
            {
                text: 'Cancelar',
                role: 'Cancelar'
            },
            {
                text: 'Borrar',
                role: 'Borrar'
            }
        ];

        const fotoUsuarioKey = ref(null) //esta clave solo sirve para tener un valor variable en la url de la foto y poder recargarla al cambiar de foto
        fotoUsuarioKey.value = new Date().getTime();

        const subirFoto = ref(false)
        const actualizarDatos = ref(false)

        const mostrarVideo = ref(false)
        const videoUrl = ref(false)

        const usuario = ref({})

        const obtenerUsuario = async () => {
            if(!props.id){
                usuario.value = await api.obtenerInformacionUsuario(usuarioLogeadoStore.idUsu);
                usuario.value.id = usuarioLogeadoStore.idUsu
            }
            else{
                usuario.value = await api.obtenerInformacionUsuario(props.id);
                usuario.value.id = props.id
            }
        };

        const cerrarSesion = () => {
            usuarioLogeadoStore.cerrarSesion;
            router.replace({ path: '/login' });
        }

        const borrarAmigo = () => {
            emit("borrarAmigo", props.id);
        };

        const alertaCerrada = async (event) => {
            if (event.detail.role === 'Borrar') {
                await api.borrarCuenta(usuarioLogeadoStore.idUsu)
                cerrarSesion()
            }
        };

        const actualizarFoto = async () => {
            await obtenerUsuario();
            subirFoto.value=false;
            fotoUsuarioKey.value = new Date().getTime();
        };

        const actualizarDatosUsu = async () => {
            await obtenerUsuario();
            actualizarDatos.value=false;
        };

        const mostrarVideoUsuario = async () => {
            if(!props.id && usuario.value.video){
                let video = await api.verVideoUsuario(usuarioLogeadoStore.idUsu)
                videoUrl.value = URL.createObjectURL(video);
                mostrarVideo.value = true;
            }
        };

        watch(usuarioLogeadoStore, () => {
            obtenerUsuario();
        });

        watch(() => route.path, (newPath, oldPath) => {
            if (newPath == '/tabs/social/perfil') {
                obtenerUsuario();
            }
        });

        obtenerUsuario();

        return { usuario , cerrarSesion, botonesAlerta, alertaCerrada, borrarAmigo, subirFoto, obtenerUsuario, actualizarFoto, fotoUsuarioKey, actualizarDatos, actualizarDatosUsu, mostrarVideo, mostrarVideoUsuario, videoUrl};
    }
}
</script>

<template>
    
    <div class="container">
        <div class="header">
            <img :class="{ 'video-border': usuario.video }" alt="imagen" @click="mostrarVideoUsuario" :src="usuario.foto ? 'http://localhost:3000/usuarios/' + usuario.id + '/foto?key=' + fotoUsuarioKey : 'https://via.placeholder.com/150x150'">
            <div v-if="!id" class="buttons">
                <button id="subirFoto" class="ok-button" @click="subirFoto=true">Modificar foto</button>
                <ion-popover :is-open="subirFoto" trigger="subirFoto" trigger-action="click" @didDismiss="subirFoto = false" side="left" alignment="start" size="auto">
                    <ion-content class="ion-padding">
                        <FotoUpload @fotoActualizada="actualizarFoto"/>
                    </ion-content>
                </ion-popover>

                <button id="actualizarDatos" class="warning-button" @click="actualizarDatos=true">Actualizar datos</button>
                <ion-popover class="actualizarDatosPop" :is-open="actualizarDatos" trigger="actualizarDatos" trigger-action="click" @didDismiss="actualizarDatos = false" side="left" alignment="start" size="auto">
                    <ion-content class="ion-padding">
                        <ActualizarDatos @datosActualizados="actualizarDatosUsu"/>
                    </ion-content>
                </ion-popover>

                <button id="borrarCuenta" class="wrong-button">Borrar cuenta</button>
                <ion-alert v-if="!id"
                    trigger="borrarCuenta"
                    header="Borrar cuenta"
                    message="¿Estas seguro de que quieres borrar tu cuenta? Esta accion es irreversible."
                    @ionAlertDidDismiss="alertaCerrada"
                    :buttons="botonesAlerta"
                ></ion-alert>
            </div>
            <div v-if="id" class="buttons">
                <button class="wrong-button" @click="borrarAmigo">Borrar amigo</button>
            </div>
        </div>
        <p>{{usuario.nick}}</p>
        <p>{{usuario.email}}</p>
        <button v-if="!id" class="wrong-button" @click="cerrarSesion">Cerrar sesion</button>
    </div>

    <ion-modal :is-open="mostrarVideo">
        <ion-header class="modalheader">
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button @click="mostrarVideo=false">
                        <ion-icon name="close-outline" ></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <video autoplay loop :src="videoUrl" style="width: 100%; height: 100%;">
            </video>
        </ion-content>
    </ion-modal>
    
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
    font-size: 18px;
}

.modalheader{
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

ion-popover {
    --backdrop-opacity: 0.6;
    --box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.6);
    --width: 250px;
}

ion-popover ion-content {
    --background: rgba(188, 188, 188, 0.25);
}

.actualizarDatosPop{
    --width: 70vw;
}

.header{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 150px;
    margin-bottom: 20px;
}

img{
    height: 150px;
    width: 150px;
    border-radius: 75px;
}

.video-border {
    border: 2px solid rgba(0, 255, 25, 0.82);
    cursor: pointer;
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
    font-size: 15px;
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

ion-modal{
    --ion-toolbar-border-color: transparent;
    --ion-toolbar-background: transparent;
}
</style>