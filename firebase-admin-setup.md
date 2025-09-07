# Configuración de Firebase Admin SDK

Para que funcionen los métodos de pago guardados, necesitas configurar las credenciales de Firebase Admin SDK.

## Pasos para obtener las credenciales:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto `teereserve-golf`
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Ve a la pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Se descargará un archivo JSON con las credenciales

## Actualizar el archivo .env.local:

Reemplaza estas líneas en tu archivo `.env.local` con los valores del archivo JSON descargado:

```
FIREBASE_PROJECT_ID=teereserve-golf
FIREBASE_CLIENT_EMAIL=[client_email del archivo JSON]
FIREBASE_PRIVATE_KEY="[private_key del archivo JSON]"
```

**Importante:** 
- El `private_key` debe estar entre comillas dobles
- Mantén los `\n` en el private_key tal como aparecen en el archivo JSON
- No compartas estas credenciales públicamente

Una vez configurado, reinicia el servidor de desarrollo con `npm run dev`.