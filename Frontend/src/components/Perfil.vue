<script>
import { IonAlert } from '@ionic/vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import { ref,watch } from 'vue'
import { useRouter } from 'vue-router';

export default{
    components: {
        IonAlert
    },
    props: ["id"],
    emits: ['borrarAmigo'],
    setup(props, { emit }){
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();
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

        const usuario = ref({})

        const obtenerUsuario = async () => {
            if(!props.id){
                usuario.value = await api.obtenerInformacionUsuario(usuarioLogeadoStore.idUsu);
            }
            else{
                usuario.value = await api.obtenerInformacionUsuario(props.id);
            }
        };

        obtenerUsuario();

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

        watch(usuarioLogeadoStore, () => {
            obtenerUsuario();
        });

        return { usuario , cerrarSesion, botonesAlerta, alertaCerrada, borrarAmigo};
    }
}
</script>

<template>
    
    <div class="container">
        <div class="header">
            <img alt="imagen" :src="usuario.foto ? 'http://localhost:3000/usuarios/' + usuario.id + '/fotoPerfil': 'https://via.placeholder.com/150x150'">
            <div v-if="!id" class="buttons">
                <button class="ok-button">Modificar foto</button>
                <button class="warning-button">Actualizar datos</button>
                <button id="borrarCuenta" class="wrong-button">Borrar cuenta</button>
            </div>
            <div v-if="id" class="buttons">
                <button class="wrong-button" @click="borrarAmigo">Borrar amigo</button>
            </div>
        </div>
        <p>{{usuario.nick}}</p>
        <p>{{usuario.email}}</p>
        <button v-if="!id" class="wrong-button" @click="cerrarSesion">Cerrar sesion</button>

        <ion-alert v-if="!id"
            trigger="borrarCuenta"
            header="Borrar cuenta"
            message="¿Estas seguro de que quieres borrar tu cuenta? Esta accion es irreversible."
            @ionAlertDidDismiss="alertaCerrada"
            :buttons="botonesAlerta"
        ></ion-alert>
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