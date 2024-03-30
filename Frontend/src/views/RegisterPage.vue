<template>
    <ion-page>
      <ion-header>
        Register
      </ion-header>
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
        </ion-header>
        <Register/>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
  import Register from '@/components/Register.vue';
  </script>