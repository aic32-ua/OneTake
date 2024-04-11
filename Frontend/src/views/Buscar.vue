<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ListadoBusqueda />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import ListadoBusqueda from '@/components/ListadoBusqueda.vue';
</script>