// ---------------------------------------------------------------------------------------------------------------------
// Глобальные настройки приложения
// ---------------------------------------------------------------------------------------------------------------------

//  Адрес бекенда с django и фроненда vue
export const __backendAddr__  = process.env.VUE_APP_BACKEND_ADDR
export const __frontendAddr__ = process.env.VUE_APP_FRONTEND_ADDR

// Папки статических медиа ресурсов на бекенде
export const __backendMediaDir__ = process.env.VUE_APP_BACKEND_MEDIA_DIR

// Адрес для загрузки медиа ресурсов
export const __backendUploads__ = process.env.VUE_APP_BACKEND_UPLOADS
