<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <Perfil/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import Perfil from '@/components/Perfil.vue';
</script>
