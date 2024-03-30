<script>

import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI'
import Usuario from './Usuario.vue'
import { ref } from 'vue'

export default{
    components:{
    Usuario
},
    setup(){
        const usuarioLogeadoStore = useUsuarioLogeadoStore(); 
        const api = new ClienteAPI();

        const usuarios = ref([]);

        const obtenerUsuarios = async () => {
        usuarios.value = await api.verListadoAmigos(usuarioLogeadoStore.idUsu);
        };

        obtenerUsuarios();

        return {usuarioLogeadoStore, api, usuarios};
    },
}
</script>

<template>
    <div class="page">
        <ul>
            <Usuario v-for="usuario in usuarios"
            :nick=usuario.nick
            :video=usuario.video
            />
        </ul>
        <br/>
    </div>
</template>

<style scoped>

.page{
    padding: 0px 30px 0px 30px;
}

.top{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

ul{
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    list-style: none;
    align-items: center;
}

ul > li {
    flex-basis: calc(100% / 10); /* Establece el ancho inicial basado en 7 elementos por fila */
    box-sizing: border-box; /* Asegura que el tamaño total incluya el relleno y el borde */
    align-items: center;
    margin: 20px 50px;
}

</style>