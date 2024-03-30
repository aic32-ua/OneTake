<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>OneTake</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ListadoUsuarios/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ListadoUsuarios from '@/components/ListadoUsuarios.vue';
</script>
