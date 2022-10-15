<template>

   <div class="flex justify-content-center flex-wrap">
<!--  Масштаб интерфейса    -->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Масштаб интерфейса </template>
         <template #content>
               <h5>{{scaleInterface}}</h5>
               <Slider v-model="scaleInterface" :step="0.025" :min="0.5" :max="1.5"/>
               <p class="mt-3 text-sm">Отрегулируйте ползунком желаемый масштаб интерфейса.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
<!--  Тема оформления-->
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Тема офорлмения </template>
         <template #content>
            <Dropdown class="w-12" v-model="theme" :options="themes" optionLabel="name" optionValue="idx" placeholder="выберите тему" />
            <p class="mt-3 text-sm"> Внимание! Темы по разному адаптированны
               к дектопам, планшетам и смартфонам. Возможны нюансы на разных ОС и браузерах.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>


   </div>

</template>

<script>
/* eslint-disable */

import {clog} from "@/components/tools/vue-utils";
import {EventBus} from "primevue/utils";

export default {
   name: "Settings",

   data() {
      return {
         // Масштаб интерфейса
         scaleInterface: 0.9,
         // Тема офорлмения
         themes: [
            {idx: 0, name: 'Saga blue',        file: '/lib/primevue/resources/themes/saga-blue/theme.css'},
            {idx: 1, name: 'Saga green',       file: '/lib/primevue/resources/themes/saga-green/theme.css'},
            {idx: 2, name: 'BS4 light blue',   file: '/lib/primevue/resources/themes/bootstrap4-light-blue/theme.css'},
            {idx: 3, name: 'BS4 dark blue',    file: '/lib/primevue/resources/themes/bootstrap4-dark-blue/theme.css'},
         ],
         theme: 0,
      }
   },

   mounted() {
      // Масштаб интерфейса
      this.scaleInterface = Number(localStorage.getItem('settings--scale-interface') || '0.9');
      // Тема оформления
      this.theme = Number(localStorage.getItem('settings--theme' || '0'));
      const themeFile = this.themes.find( i => i.idx === this.theme ).file;
      document.getElementById('theme-link').setAttribute('href', themeFile);
   },

   watch: {
      // Масштаб интерфейса
      scaleInterface(newVal) {
         document.getElementsByTagName("html")[0].style["font-size"] = `${this.scaleInterface}em`;
         localStorage.setItem('settings--scale-interface', this.scaleInterface);
      },
      // Тема оформления
      theme(newVal) {
         const themeFile = this.themes.find( i => i.idx === newVal).file;
         document.getElementById('theme-link').setAttribute('href', themeFile)
         localStorage.setItem('settings--theme', newVal);
      }
   },
}
</script>

<style scoped>

</style>