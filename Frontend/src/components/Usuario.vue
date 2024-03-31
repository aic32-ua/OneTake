<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import { ref } from 'vue';
export default{
    props: ["nick", "video", "id"],
    setup() {
        const usuarioLogeadoStore = useUsuarioLogeadoStore();
        const isOpen = ref(false);
        return { usuarioLogeadoStore, isOpen};
    }
}

</script>

<template>
    
    <li :id="id">
        <div>
            <p>{{nick}}</p>
        </div>
    </li>
    
</template>

<style scoped>
.li{
    height: 60px;
}
</style>