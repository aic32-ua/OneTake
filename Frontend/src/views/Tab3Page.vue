<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>OneTake</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
    
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="top">
          <ion-tab-button tab="tab1" href="/tabs3/tab1">
            <ion-label>Buscar</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/tabs3/tab2">
            <ion-label>Peticiones</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab3" href="/tabs3/tab3">
            <ion-label>Amigos</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab4" href="/tabs3/tab4">
            <ion-label>Cuenta</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonTabs, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>
