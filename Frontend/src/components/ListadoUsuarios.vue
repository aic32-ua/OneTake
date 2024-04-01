<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import Usuario from './Usuario.vue'
import Buscador from './Buscador.vue'
import { ref } from 'vue'

export default{
    components:{
    Usuario,
    Buscador
},
    props: {
        tipoLista: String
    },
    setup(props){

        const tipoLista = props.tipoLista;

        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();

        const usuarios = ref([]);
        const peticiones = ref([]);
        const busqueda = ref(null)

        const obtenerUsuarios = async () => {
            usuarios.value = await api.verListadoAmigos(usuarioLogeadoStore.idUsu);
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
            peticiones.value = await api.verListadoPeticionesAmistadUsuario(usuarioLogeadoStore.idUsu);
        };

        const aceptarPeticion = async (id) => {
            await api.aceptarPeticionAmistad(id)
            obtenerPeticiones();
        };

        const rechazarPeticion = async (id) => {
            await api.rechazarPeticionAmistad(id)
            obtenerPeticiones();
        };

        if(tipoLista=="home"){
            obtenerUsuarios();
        }
        else if(tipoLista=="peticiones"){
            obtenerPeticiones();
        }

        return { usuarios, peticiones, tipoLista, buscarUsuarios, enviarPeticion, aceptarPeticion, rechazarPeticion};
    }
}
</script>

<template>
    <Buscador v-if="tipoLista=='buscar'" @buscarUsuarios="buscarUsuarios"/>
    <ul>
        <Usuario v-for="usuario in usuarios" v-if="tipoLista!='peticiones'"
        :nick=usuario.nick
        :video=usuario.video
        :id="usuario.id"
        :peticion="usuario.peticion"
        :tipoLista=tipoLista
        @enviarPeticion="enviarPeticion"
        />
        <Usuario v-for="peticion in peticiones" v-if="tipoLista=='peticiones'"
        :id="peticion.id_emisor"
        :idPeticion="peticion.id"
        :tipoLista=tipoLista
        @aceptarPeticion="aceptarPeticion"
        @rechazarPeticion="rechazarPeticion"
        />
    </ul>
</template>

<style scoped>
ul{
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    flex-direction: column;
    list-style: none;
}
</style>