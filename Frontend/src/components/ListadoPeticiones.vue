<script>
import { IonModal, IonButton, IonHeader, IonButtons, IonTitle, IonToolbar, IonContent, IonIcon, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonInfiniteScroll, IonInfiniteScrollContent, IonRippleEffect } from '@ionic/vue';
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
    IonItem,
    IonItemSliding,
    IonItemOption,
    IonItemOptions,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRippleEffect
},
    setup(){
        const route = useRoute();
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();
        const mostrarModal = ref(false)
        const idPerfil = ref(null)
        const usuarios = ref([]);
        let page = 1;

        const mostrarPerfilUsuario = async (idUsuario) => {
            idPerfil.value = idUsuario
            mostrarModal.value = true;
        };

        const cerrarModal = () => {
            idPerfil.value = null
            mostrarModal.value = false;
        };

        const obtenerPeticiones = async (page) => {
            const peticiones = await api.verListadoPeticionesAmistadUsuario(usuarioLogeadoStore.idUsu,page);
            if(page==1){
                usuarios.value = [];
            }
            for (const peticion of peticiones) {
                const usuario = await api.obtenerInformacionUsuario(peticion.id_emisor);
                usuario.id = peticion.id_emisor
                usuario.idPeticion = peticion.id;
                usuarios.value.push(usuario);
            }
        };

        const aceptarPeticion = async (id) => {
            await api.aceptarPeticionAmistad(id)
            obtenerPeticiones(1);
        };

        const rechazarPeticion = async (id) => {
            await api.rechazarPeticionAmistad(id)
            obtenerPeticiones(1);
        };

        obtenerPeticiones(1);

        watch(usuarioLogeadoStore, () => {
            obtenerPeticiones(1);
        });

        watch(() => route.path, (newPath, oldPath) => {
            if (newPath === '/tabs/social/peticiones') {
                obtenerPeticiones(1);   
            }
        });

        const ionInfinite = () => {
            page++;
            obtenerPeticiones(page)
        };

        return { usuarios, aceptarPeticion, rechazarPeticion, mostrarPerfilUsuario, cerrarModal, mostrarModal, idPerfil, ionInfinite};
    }
}
</script>

<template>
    <ion-list v-if="usuarios.length > 0">
        <ion-item-sliding v-for="(usuario, usuarioIndex) in usuarios">
            <ion-item class="ion-activatable" :lines="usuarioIndex === usuarios.length - 1 ? 'none' : 'full'">
                <Usuario
                :nick=usuario.nick
                :video=usuario.video
                :id="usuario.id"
                :peticion="usuario.peticion"
                :idPeticion="usuario.idPeticion"
                :tipoLista="'peticiones'"
                :foto="usuario.foto"
                @mostrarPerfil="mostrarPerfilUsuario"
                @aceptarPeticion="aceptarPeticion"
                />
            </ion-item>
            <ion-ripple-effect></ion-ripple-effect>
            <ion-item-options>
                <ion-item-option color="danger" @click="rechazarPeticion(usuario.idPeticion)">Borrar</ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
    </ion-list>
    <ion-infinite-scroll @ionInfinite="ionInfinite" v-if="usuarios.length > 0 && usuarios.length%10===0">
      <ion-infinite-scroll-content v-if="usuarios.length > 0 && usuarios.length%10===0"></ion-infinite-scroll-content>
    </ion-infinite-scroll>

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
            <Perfil :id="idPerfil"/>
        </ion-content>
    </ion-modal>

    <p class="message" v-if="usuarios.length === 0">No hay peticiones de amistad pendientes.</p>
    
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
</style>