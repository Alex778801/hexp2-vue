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
            <Dropdown class="w-12" v-model="themeIdx" :options="themes" optionLabel="name" optionValue="idx" placeholder="выберите тему" />
            <p class="mt-3 text-sm"> Внимание! Темы по разному адаптированны
               к дектопам, планшетам и смартфонам. Возможны нюансы на разных ОС и браузерах.
               Настройка задается индивидуально для каждого устройства и браузера</p>
         </template>
      </Card>


   </div>

</template>

<script>
/* eslint-disable */

import { settingsUtils } from "./tools/settings-utils"

export default {
   name: "Settings",

   data() {
      return {
         // Масштаб интерфейса
         scaleInterface: settingsUtils.loadScaleInterface(),
         // Тема офорлмения
         themes: settingsUtils.themes,
         themeIdx: settingsUtils.loadTheme().idx,
      }
   },

   mounted() {
      // Инициализация настроек приложения
      settingsUtils.init();
   },

   watch: {
      // Масштаб интерфейса
      scaleInterface(newVal) {
         settingsUtils.applyScaleInterface(newVal);
         settingsUtils.saveScaleInterface(newVal);
      },
      // Тема оформления
      themeIdx(newVal) {
         this.themeIdx = newVal;
         settingsUtils.applyTheme(newVal);
         settingsUtils.saveTheme(newVal);
      }
   },
}
</script>

<style scoped>

</style>