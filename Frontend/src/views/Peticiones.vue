<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ListadoUsuarios tipoLista="peticiones"/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ListadoUsuarios from '@/components/ListadoUsuarios.vue';
</script>