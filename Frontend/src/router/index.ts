import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        children: [
          {
            path: 'tab3',
            redirect: '/tabs3/tab1'
          },
          {
            path: '/tabs3/tab1',
            component: () => import('@/views/Buscar.vue')
          },
          {
            path: '/tabs3/tab2',
            component: () => import('@/views/Peticiones.vue')
          },
          {
            path: '/tabs3/tab3',
            component: () => import('@/views/Amigos.vue')
          },
          {
            path: '/tabs3/tab4',
            component: () => import('@/views/Cuenta.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;