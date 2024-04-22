<script>
import { IonModal, IonButton, IonHeader, IonButtons, IonTitle, IonToolbar, IonContent, IonIcon, IonList, IonItemDivider, IonItemGroup, IonItem , IonToast, IonRippleEffect} from '@ionic/vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import { useRoute } from 'vue-router';
import ClienteAPI from '../ClienteAPI'
import Usuario from './Usuario.vue'
import Perfil from './Perfil.vue'
import { ref,watch } from 'vue'

export default{
    components:{
    Usuario,
    Perfil,
    IonModal,
    IonButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonIcon,
    IonList,
    IonItemDivider,
    IonItemGroup,
    IonItem,
    IonToast,
    IonRippleEffect
},
    setup(){
        const route = useRoute();
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();

        const videoUrl = ref(false)
        const mostrarVideo = ref(false)
        const mostrarModal = ref(false)
        const idPerfil = ref(null)
        const mostrarError = ref(false)
        const error = ref('')

        const usuarios = ref([]);
        const amigosLetra = ref(null)

        const mostrarPerfilUsuario = async (idUsuario) => {
            idPerfil.value = idUsuario
            mostrarModal.value = true;
        };

        const validarSesion = async () => {
            let resp = await api.validarSesion();

            if(resp==null){
                usuarioLogeadoStore.cerrarSesion();
            }
            else {
                usuarioLogeadoStore.iniciarSesion({ newToken: resp.jwt, newId: resp.id})
            }
        };

        const mostrarVideoUsuario = async (idUsuario) => {
            let video = await api.verVideoUsuario(idUsuario)
            if(video!=null && video instanceof Blob){
                videoUrl.value = URL.createObjectURL(video);
                idPerfil.value = idUsuario
                mostrarVideo.value = true;
            }
            else if(typeof video === 'string'){
                error.value = video;
                mostrarError.value = true;
            }
        };

        const cerrarModal = () => {
            idPerfil.value = null
            mostrarModal.value = false;
        };

        const cerrarModalVideo = () => {
            idPerfil.value = null
            videoUrl.value = null
            URL.revokeObjectURL(videoUrl.value);
            mostrarVideo.value = false;
        };

        const obtenerUsuarios = async () => {
            if(usuarioLogeadoStore.idUsu){
                usuarios.value = await api.verListadoAmigos(usuarioLogeadoStore.idUsu);
    
                const grupos = {};
                usuarios.value.forEach(usu => {
                    const letra = usu.nick.charAt(0).toUpperCase();
                    if (!grupos[letra]) {
                    grupos[letra] = [];
                    }
                    grupos[letra].push(usu);
                });
    
                const gruposOrdenados = {};
                Object.keys(grupos).sort().forEach(letra => {
                    gruposOrdenados[letra] = grupos[letra].sort((a, b) => a.nick.localeCompare(b.nick));
                });
    
                amigosLetra.value = gruposOrdenados
            }
        };

        const borrarAmigo = async (id) => {
            cerrarModal()
            await api.borrarRelacionAmistad(usuarioLogeadoStore.idUsu, id)
            obtenerUsuarios();
        };

        obtenerUsuarios();

        watch(usuarioLogeadoStore, () => {
            obtenerUsuarios();
        });

        watch(() => route.path, (newPath, oldPath) => {
            if (newPath === '/tabs/home') {
                obtenerUsuarios();   
            }
        });

        validarSesion();

        return { usuarios, mostrarPerfilUsuario, borrarAmigo, mostrarVideoUsuario, cerrarModal, cerrarModalVideo, mostrarModal, mostrarVideo, mostrarError, error, videoUrl, idPerfil, amigosLetra};
    }
}
</script>

<template>
    <ion-list>
        <template v-for="(lista, letra) in amigosLetra" :key="letra">
          <ion-item-divider :id="`divider-${letra}`">
            {{ letra }}
          </ion-item-divider>
          <ion-item-group>
                <ion-item class="ion-activatable" v-for="(usuario, usuarioIndex) in lista" :lines="usuarioIndex === lista.length - 1 ? 'none' : 'full'">
                    <Usuario 
                    :nick=usuario.nick
                    :video=usuario.video
                    :id="usuario.id"
                    :peticion="usuario.peticion"
                    :idPeticion="usuario.idPeticion"
                    :tipoLista="'home'"
                    :foto="usuario.foto"
                    @mostrarVideo="mostrarVideoUsuario"
                    @mostrarPerfil="mostrarPerfilUsuario"
                    />
                </ion-item>
                <ion-ripple-effect></ion-ripple-effect>
          </ion-item-group>
        </template>
    </ion-list>

    <ion-modal :is-open="mostrarModal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button @click="cerrarModal">
                        <ion-icon name="close-outline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <Perfil :id="idPerfil"
            @borrarAmigo="borrarAmigo"/>
        </ion-content>
    </ion-modal>

    <ion-modal :is-open="mostrarVideo">
        <ion-header class="header">
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button @click="cerrarModalVideo">
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

    <p class="message" v-if="usuarios.length === 0">¡Añade amigos desde el tab social para no perderte nada!</p>

    <ion-toast class="custom-toast" position="top" position-anchor="header" :is-open="mostrarError" :message="error" :duration="3000" @didDismiss="mostrarError=false"></ion-toast>
    
</template>

<style scoped>
ion-list{
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
}

.message{
    margin-left: 30px;
    margin-right: 30px;
    margin-top: 20px;
    color: #BCBCBC;
}

.header{
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

ion-modal{
    --ion-toolbar-border-color: transparent;
    --ion-toolbar-background: transparent;
}

ion-toast.custom-toast::part(message) {
    font-size: 16px;
}

</style>