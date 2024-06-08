<script>
import { IonModal, IonButton, IonHeader, IonButtons, IonTitle, IonToolbar, IonContent, IonIcon, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonInfiniteScroll, IonInfiniteScrollContent, IonRippleEffect } from '@ionic/vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import Usuario from './Usuario.vue'
import Perfil from './Perfil.vue'
import Buscador from './Buscador.vue'
import { ref,watch } from 'vue'

export default{
    components:{
    Usuario,
    Buscador,
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
        const usuarioLogeadoStore = useUsuarioLogeadoStore();
        const api = new ClienteAPI();
        const mostrarModal = ref(false)
        const idPerfil = ref(null)
        let page = 1;

        const usuarios = ref([]);
        const busqueda = ref(null)

        const mostrarPerfilUsuario = async (idUsuario) => {
            idPerfil.value = idUsuario
            mostrarModal.value = true;
        };

        const cerrarModal = () => {
            idPerfil.value = null
            mostrarModal.value = false;
        };

        const buscarUsuarios = async (nombre) => {
            usuarios.value = await api.buscarUsuarioPorNick(nombre,1);
            busqueda.value = nombre //guardo el criterio de la ultima busqueda ya que si envias una peticion hay que recargar el listado filtrando de nuevo por ese criterio
        };

        const enviarPeticion = async (id) => {
            await api.enviarPeticionAmistad(usuarioLogeadoStore.idUsu, id)
            usuarios.value.find(usuario => usuario.id === id).peticion = true;
        };

        const borrarAmigo = async (id) => {
            cerrarModal()
            await api.borrarRelacionAmistad(usuarioLogeadoStore.idUsu, id)
        };

        const ionInfinite = async () => {
            page++;
            usuarios.value = usuarios.value.concat(await api.buscarUsuarioPorNick(busqueda.value,page));
        };

        watch(usuarioLogeadoStore, () => {
            usuarios.value=[];
        });

        return { usuarios, buscarUsuarios, enviarPeticion, mostrarPerfilUsuario, cerrarModal, borrarAmigo, mostrarModal, idPerfil, ionInfinite, busqueda};
    }
}
</script>

<template>
    <Buscador @buscarUsuarios="buscarUsuarios"/>

    <ion-list v-if="usuarios.length > 0">
            <ion-item class="ion-activatable" v-for="(usuario, usuarioIndex) in usuarios" :lines="usuarioIndex === usuarios.length - 1 ? 'none' : 'full'">
                <Usuario
                :nick=usuario.nick
                :video=usuario.video
                :id="usuario.id"
                :peticion="usuario.peticion"
                :idPeticion="usuario.idPeticion"
                :tipoLista="'buscar'"
                :foto="usuario.foto"
                @mostrarPerfil="mostrarPerfilUsuario"
                @enviarPeticion="enviarPeticion"
                />
            </ion-item>
            <ion-ripple-effect></ion-ripple-effect>
    </ion-list>
    <ion-infinite-scroll @ionInfinite="ionInfinite" v-if="usuarios.length > 0 && usuarios.length%10===0">
      <ion-infinite-scroll-content v-if="usuarios.length > 0 && usuarios.length%10===0"></ion-infinite-scroll-content>
    </ion-infinite-scroll>

    <p class="message" v-if="usuarios.length === 0 && busqueda!=null">No se han encontrado resultados.</p>

    <ion-modal :is-open="mostrarModal">
        <ion-header>
            <ion-toolbar>
            <ion-title>Perfil</ion-title>
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