import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Proximamente from '@/views/Proximamente'
import TravelSelection from '@/views/TravelSelection'
import BusSelection from '@/views/BusSelection'
import PayAmount from '@/views/PayAmount'
import PurchaseDetail from '@/views/PurchaseDetail'
import OutOfService from "@/views/OutOfService"
import PrintTicket from "@/views/PrintTicket";

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: (IS_STANDBY) ? 'Proximamente' : 'Home',
      component: (IS_STANDBY) ? Proximamente : Home
    },
    {
      path: '/travelselection',
      name: 'TravelSelection',
      component: TravelSelection
    },
    {
      path: '/busselection',
      name: 'BusSelection',
      component: BusSelection
    },
    {
      path: '/purchasedetail',
      name: 'PurchaseDetail',
      component: PurchaseDetail
    },
    {
      path: '/payamount',
      name: 'PayAmount',
      component: PayAmount
    },
    {
      path: '/outofservice',
      name: 'OutOfService',
      component: OutOfService
    },
    {
      path: '/print',
      name: 'PrintTicket',
      component: PrintTicket
    }
  ]
})
