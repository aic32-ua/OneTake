<template>
  <ion-page>
    <ion-header id="header">
      <ion-toolbar>
        <ion-title>OneTake</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ListadoAmigos/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ListadoAmigos from '@/components/ListadoAmigos.vue';
</script>
