<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
      </ion-header>
      <Login/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent } from '@ionic/vue';
import Login from '@/components/Login.vue';
</script>
  