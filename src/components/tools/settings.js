/* eslint-disable */

export const settings = {
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
   // Инициализация
   init() {

   },
   //------------------------------------------------------------------------------------------------------------------
   // Масштаб интерфейса
   loadScaleInterface() {
      return Number(localStorage.getItem('settings--scale-interface') || '0.9');
   },
   applyScaleInterface(scale) {
      document.getElementsByTagName("html")[0].style["font-size"] = `${scale}em`;
   },
   saveScaleInterface(scale) {
      localStorage.setItem('settings--scale-interface', scale);
   },
   //------------------------------------------------------------------------------------------------------------------
   // Тема оформления
   loadTheme() {
      const idx = Number(localStorage.getItem('settings--theme' || '0'));
      const themeFile = this.themes.find(i => i.idx === idx).file;
      return {idx, themeFile};
   },
   applyTheme(idx) {
      const themeFile = this.themes.find(i => i.idx === idx).file;
      document.getElementById('theme-link').setAttribute('href', themeFile)
   },
   saveTheme(idx) {
      const themeFile = this.themes.find( i => i.idx === idx).file;
      localStorage.setItem('settings--theme', idx);
   },
   //
}