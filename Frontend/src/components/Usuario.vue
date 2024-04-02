<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
export default{
    props: ["nick", "video", "id", "tipoLista", "peticion" ,"idPeticion", "foto"],
    emits: ['enviarPeticion', 'aceptarPeticion', 'rechazarPeticion'],
    setup(props, { emit }) {
        const usuarioLogeadoStore = useUsuarioLogeadoStore();

        const enviarPeticion = () => {
            emit("enviarPeticion", props.id);
        };
        const aceptarPeticion = () => {
            emit("aceptarPeticion", props.idPeticion);
        };
        const rechazarPeticion = () => {
            emit("rechazarPeticion", props.idPeticion);
        };

        return { usuarioLogeadoStore, enviarPeticion, aceptarPeticion, rechazarPeticion};
    }
}

</script>

<template>
    
    <li :id="id">
        <div class="container">
            <div class="usuario">
                <img alt="imagen" :src="foto ? 'http://localhost:3000/usuarios/' + id + '/fotoPerfil': 'https://via.placeholder.com/50x50'">
                <p>{{nick}}</p>
            </div>
            <button class="aceptar-button" v-if="tipoLista=='buscar' && !peticion" @click="enviarPeticion">Añadir amigo</button>
            <div v-if="tipoLista=='peticiones'" class="contenedorBotones">
                <button class="aceptar-button"  @click="aceptarPeticion">Aceptar</button>
                <button class="rechazar-button" @click="rechazarPeticion">Rechazar</button>
            </div>
        </div>
    </li>
    
</template>

<style scoped>
.usuario{
    display: flex;
    flex-direction: row;
}

.container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-right: 15px;
    height: 60px
}

.contenedorBotones{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 50%;
}

img{
    height: 50px;
    width: 50px;
    border-radius: 25px;
    margin-right: 10px;
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