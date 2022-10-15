<template>

   <div class="flex justify-content-center flex-wrap">
      <Card class="flex justify-content-center m-2" style="width: 20rem; margin-bottom: 2em">
         <template #title> Масштаб интерфейса </template>
         <template #content>
               <h5>Масштаб: {{scaleInterface}}</h5>
               <Slider v-model="scaleInterface" :step="0.025" :min="0.5" :max="1.5"/>
               <p class="mt-3">Отрегулируйте ползунком желаемый масштаб интерфейса.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>
   </div>

</template>

<script>
/* eslint-disable */


import {clog} from "@/components/tools/vue-utils";

export default {
   name: "Settings",

   data() {
      return {
         scaleInterface: 0.9,
      }
   },

   mounted() {
      this.scaleInterface = Number(localStorage.getItem('settings--scale-interface') || '0.9');
   },

   watch: {
      scaleInterface(newVal) {
         document.getElementsByTagName("html")[0].style["font-size"] = `${this.scaleInterface}em`;
         localStorage.setItem('settings--scale-interface', this.scaleInterface);
      },
   },
}
</script>

<style scoped>

</style>