<script>
import { IonIcon } from '@ionic/vue';
export default{
    components: {
        IonIcon
    },
    emits: ['buscarUsuarios'],
    data: function(){
        return{
            nombre: ""
        }
    },
    methods: {
        async buscarUsuarios(){
            if(this.nombre.length > 0 ){
                this.$emit("buscarUsuarios", this.nombre)
            }
        }
    },
}
</script>

<template>
    <div class="container">
        <input type="text" placeholder="Nombre de usuario" v-model="nombre">
        <button @click="buscarUsuarios">
            <ion-icon name="search-sharp"></ion-icon>
        </button> 
    </div>
</template>

<style scoped>
ion-icon {
  font-size: 22px;
}
.container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 15px 30px 0px 30px;
}
button{
    background-color: rgba(188, 188, 188, 0.25);
    border-radius: 13px;
    padding: 10px;
    width: 40px;
    height: 40px;
}
input{
    border: transparent;
    border-radius: 13px;
    padding: 10px;
    outline: none;
    background-color: rgba(188, 188, 188, 0.25);
    font-size: 16px;
    height: 40px;
    width: 80%
}

input::placeholder {
  color: #BCBCBC;
}
</style>