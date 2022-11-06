// ---------------------------------------------------------------------------------------------------------------------
// Глобальные настройки приложения
// ---------------------------------------------------------------------------------------------------------------------

//  Адрес бекенда с django и фроненда vue
// export const __backendAddr__  = 'http://192.168.1.222:8000';
// export const __frontendAddr__ = 'http://192.168.1.222:8080';
export const __backendAddr__  = process.env.VUE_APP_BACKEND_ADDR
export const __frontendAddr__ = process.env.VUE_APP_FRONTEND_ADDR

// Папки статических медиа ресурсов на бекенде
// export const __backendMediaDir__ = '/media/'
export const __backendMediaDir__ = process.env.VUE_APP_BACKEND_MEDIA_DIR
