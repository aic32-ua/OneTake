<script>
import { IonModal, IonButton, IonHeader, IonButtons, IonTitle, IonToolbar, IonContent, IonIcon, IonList, IonItemDivider, IonItemGroup, IonItem, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import { useRoute } from 'vue-router';
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
    IonItemDivider,
    IonItemGroup,
    IonItem,
    IonItemSliding,
    IonItemOption,
    IonItemOptions
},
    props: {
        tipoLista: String
    },
    setup(props){
        const route = useRoute();

        const tipoLista = props.tipoLista;

        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();

        const videoUrl = ref(false)
        const mostrarVideo = ref(false)
        const mostrarModal = ref(false)
        const idPerfil = ref(null)

        const mostrarPerfilUsuario = async (idUsuario) => {
            idPerfil.value = idUsuario
            mostrarModal.value = true;
        };

        const mostrarVideoUsuario = async (idUsuario) => {
            if(tipoLista=="home"){
                let video = await api.verVideoUsuario(idUsuario)
                videoUrl.value = URL.createObjectURL(video);
                idPerfil.value = idUsuario
                mostrarVideo.value = true;
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

        const usuarios = ref([]);
        const amigosLetra = ref(null)
        const busqueda = ref(null)

        const obtenerUsuarios = async () => {
            usuarios.value = await api.verListadoAmigos(usuarioLogeadoStore.idUsu);

            if(tipoLista=="home"){
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

        const buscarUsuarios = async (nombre) => {
            usuarios.value = await api.buscarUsuarioPorNick(nombre);
            busqueda.value = nombre //guardo el criterio de la ultima busqueda ya que si envias una peticion hay que recargar el listado filtrando de nuevo por ese criterio
        };

        const enviarPeticion = async (id) => {
            await api.enviarPeticionAmistad(usuarioLogeadoStore.idUsu, id)
            buscarUsuarios(busqueda.value)
        };

        const obtenerPeticiones = async () => {
            const peticiones = await api.verListadoPeticionesAmistadUsuario(usuarioLogeadoStore.idUsu);
            usuarios.value = [];
            for (const peticion of peticiones) {
                const usuario = await api.obtenerInformacionUsuario(peticion.id_emisor);
                usuario.idPeticion = peticion.id;
                usuarios.value.push(usuario);
            }
        };

        const aceptarPeticion = async (id) => {
            await api.aceptarPeticionAmistad(id)
            obtenerPeticiones();
        };

        const rechazarPeticion = async (id) => {
            await api.rechazarPeticionAmistad(id)
            obtenerPeticiones();
        };

        const borrarAmigo = async (id) => {
            cerrarModal()
            await api.borrarRelacionAmistad(usuarioLogeadoStore.idUsu, id)
            if(tipoLista=="home"){
                obtenerUsuarios();
            }
        };

        if(tipoLista=="home"){
            obtenerUsuarios();
        }
        else if(tipoLista=="peticiones"){
            obtenerPeticiones();
        }

        watch(usuarioLogeadoStore, () => {
            if(tipoLista=="home"){
                obtenerUsuarios();
            }
            else if(tipoLista=="peticiones"){
                obtenerPeticiones();
            }
            else if(tipoLista=="buscar"){
                usuarios.value=[];
            }
        });

        watch(() => route.path, (newPath, oldPath) => {
            if (newPath === '/tabs/home' && tipoLista=="home") {
                obtenerUsuarios();   
            }
            if (newPath === '/tabs/social/peticiones' && tipoLista=="peticiones") {
                obtenerPeticiones();   
            }
        });

        return { usuarios, tipoLista, buscarUsuarios, enviarPeticion, aceptarPeticion, rechazarPeticion, mostrarPerfilUsuario, mostrarVideoUsuario, cerrarModal, cerrarModalVideo, borrarAmigo, mostrarModal, mostrarVideo, videoUrl, idPerfil, amigosLetra};
    }
}
</script>

<template>
    <Buscador v-if="tipoLista=='buscar'" @buscarUsuarios="buscarUsuarios"/>

    <ion-list v-if="usuarios.length > 0 && tipoLista=='peticiones' || tipoLista=='buscar'">
        <ion-item-sliding v-for="(usuario, usuarioIndex) in usuarios" :lines="usuarioIndex === usuarios.length - 1 ? 'none' : 'full'">
            <ion-item>
                <Usuario
                :nick=usuario.nick
                :video=usuario.video
                :id="usuario.id"
                :peticion="usuario.peticion"
                :idPeticion="usuario.idPeticion"
                :tipoLista=tipoLista
                :foto="usuario.foto"
                @mostrarVideo="mostrarVideoUsuario"
                @mostrarPerfil="mostrarPerfilUsuario"
                @enviarPeticion="enviarPeticion"
                @aceptarPeticion="aceptarPeticion"
                />
            </ion-item>
                
            <ion-item-options>
                <ion-item-option v-if="tipoLista=='peticiones'" color="danger" @click="rechazarPeticion(usuario.idPeticion)">Borrar</ion-item-option>
            </ion-item-options>
        </ion-item-sliding>
    </ion-list>

    <ion-list v-if="tipoLista=='home'">
        <template v-for="(lista, letra) in amigosLetra" :key="letra">
          <ion-item-divider :id="`divider-${letra}`">
            {{ letra }}
          </ion-item-divider>
          <ion-item-group>
                <ion-item v-for="(usuario, usuarioIndex) in lista" :lines="usuarioIndex === lista.length - 1 ? 'none' : 'full'">
                    <Usuario 
                    :nick=usuario.nick
                    :video=usuario.video
                    :id="usuario.id"
                    :peticion="usuario.peticion"
                    :idPeticion="usuario.idPeticion"
                    :tipoLista=tipoLista
                    :foto="usuario.foto"
                    @mostrarVideo="mostrarVideoUsuario"
                    @mostrarPerfil="mostrarPerfilUsuario"
                    @enviarPeticion="enviarPeticion"
                    @aceptarPeticion="aceptarPeticion"
                    />
                </ion-item>
          </ion-item-group>
        </template>
    </ion-list>

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

    <p class="message" v-if="(tipoLista === 'home') && usuarios.length === 0">¡Añade amigos desde el tab social para no perderte nada!</p>
    <p class="message" v-else-if="tipoLista === 'peticiones' && usuarios.length === 0">No hay peticiones de amistad pendientes.</p>
    
</template>

<style scoped>
ion-list{
    display: flex;
    flex-wrap: wrap;
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