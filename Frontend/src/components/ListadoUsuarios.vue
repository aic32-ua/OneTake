<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import Usuario from './Usuario.vue'
import Buscador from './Buscador.vue'
import { ref, defineProps} from 'vue'

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

        const obtenerUsuarios = async () => {
            usuarios.value = await api.verListadoAmigos(usuarioLogeadoStore.idUsu);
        };

        const buscarUsuarios = async (nombre) => {
            usuarios.value = await api.buscarUsuarioPorNick(nombre);
        };

        if(tipoLista=="home"){
            obtenerUsuarios();
        }

        return {usuarioLogeadoStore, api, usuarios, tipoLista, buscarUsuarios};
    }
}
</script>

<template>
    <Buscador v-if="tipoLista=='buscar'" @buscarUsuarios="buscarUsuarios"/>
    <ul>
        <Usuario v-for="usuario in usuarios"
        :nick=usuario.nick
        :video=usuario.video
        />
    </ul>
</template>

<style scoped>

.top{
    display: flex;
    flex-direction: row;
    align-items: center;
}

ul{
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    flex-direction: column;
    list-style: none;
}
</style>