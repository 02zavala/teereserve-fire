# Configuración de Zoho Mail OAuth2 para TeeReserve

Este documento explica cómo obtener el `ZOHO_MAIL_REFRESH_TOKEN` necesario para el envío de correos electrónicos.

## Pasos para obtener el Refresh Token

### 1. Crear una aplicación en Zoho API Console

1. Ve a [Zoho API Console](https://api-console.zoho.com/)
2. Haz clic en "Add Client"
3. Selecciona "Server-based Applications"
4. Completa los campos:
   - **Client Name**: TeeReserve Mail
   - **Homepage URL**: https://teereserve.golf
   - **Authorized Redirect URIs**: https://teereserve.golf/auth/callback
5. Guarda el `Client ID` y `Client Secret`

### 2. Generar el Grant Token

1. Construye la URL de autorización:
```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.Send.ALL&client_id={CLIENT_ID}&response_type=code&access_type=offline&redirect_uri={REDIRECT_URI}&prompt=consent
```

2. Reemplaza:
   - `{CLIENT_ID}`: Tu Client ID de Zoho
   - `{REDIRECT_URI}`: https://teereserve.golf/auth/callback (debe estar URL encoded)

3. Visita la URL en tu navegador
4. Autoriza la aplicación
5. Copia el `code` del parámetro de la URL de redirección

### 3. Intercambiar el Grant Token por Access y Refresh Tokens

Haz una petición POST a:
```
https://accounts.zoho.com/oauth/v2/token
```

Con los siguientes parámetros:
```
grant_type=authorization_code
client_id={CLIENT_ID}
client_secret={CLIENT_SECRET}
redirect_uri={REDIRECT_URI}
code={GRANT_TOKEN}
```

### 4. Ejemplo con cURL

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=TU_CLIENT_ID" \
  -d "client_secret=TU_CLIENT_SECRET" \
  -d "redirect_uri=https://teereserve.golf/auth/callback" \
  -d "code=TU_GRANT_TOKEN"
```

### 5. Respuesta esperada

```json
{
  "access_token": "1000.xxx",
  "refresh_token": "1000.yyy",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### 6. Actualizar .env.local

Copia el `refresh_token` y actualiza tu archivo `.env.local`:

```env
ZOHO_MAIL_CLIENT_ID=tu_client_id
ZOHO_MAIL_CLIENT_SECRET=tu_client_secret
ZOHO_MAIL_REFRESH_TOKEN=1000.yyy_tu_refresh_token
ZOHO_MAIL_FROM=info@teereserve.golf
```

## Notas importantes

- El refresh token es válido indefinidamente hasta que sea revocado
- Solo se permiten 20 refresh tokens por usuario
- El access token expira cada hora, pero se renueva automáticamente con el refresh token
- Asegúrate de usar el mismo dominio (US/EU) para todos los pasos

## Verificación

Para verificar que la configuración funciona, puedes probar enviando un email de prueba usando las funciones de la aplicación.

## Referencias

- [Zoho Mail OAuth 2.0 Guide](https://www.zoho.com/mail/help/api/using-oauth-2.html)
- [Zoho OAuth Steps](https://www.zoho.com/people/api/oauth-steps.html)