<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ListadoPeticiones/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ListadoPeticiones from '@/components/ListadoPeticiones.vue';
</script>