<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import { ref } from 'vue'
export default{
    props: ["nick", "video", "id", "tipoLista", "peticion" ,"idPeticion"],
    emits: ['enviarPeticion', 'aceptarPeticion', 'rechazarPeticion'],
    setup(props, { emit }) {
        const usuarioLogeadoStore = useUsuarioLogeadoStore();
        const usuario = ref(null)

        const enviarPeticion = () => {
            emit("enviarPeticion", props.id);
        };
        const aceptarPeticion = () => {
            emit("aceptarPeticion", props.idPeticion);
        };
        const rechazarPeticion = () => {
            emit("rechazarPeticion", props.idPeticion);
        };

        const api = new ClienteAPI();

        const obtenerInfoUsu = async () => {
            usuario.value =  await api.obtenerInformacionUsuario(props.id)
        };

        if(props.tipoLista == "peticiones"){
            obtenerInfoUsu()
        }

        return { usuarioLogeadoStore, usuario, enviarPeticion, aceptarPeticion, rechazarPeticion};
    }
}

</script>

<template>
    
    <li :id="id">
        <div class="container">
            <p v-if="tipoLista=='peticiones'">{{usuario ? usuario.nick : ''}}</p>
            <p v-else>{{nick}}</p>
            <div class="contenedorBotones">
                <button class="aceptar-button" v-if="tipoLista=='buscar' && !peticion" @click="enviarPeticion">Añadir amigo</button>
                <button class="aceptar-button" v-if="tipoLista=='peticiones'" @click="aceptarPeticion">Aceptar</button>
                <button class="rechazar-button" v-if="tipoLista=='peticiones'" @click="rechazarPeticion">Rechazar</button>
            </div>
        </div>
    </li>
    
</template>

<style scoped>
.li{
    height: 60px;
}

.container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-right: 15px;
}

.contenedorBotones{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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
</style>