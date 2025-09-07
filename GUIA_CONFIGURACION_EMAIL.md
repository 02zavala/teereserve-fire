# 📧 Guía de Configuración de Notificaciones por Email

## 🎯 Resumen
Esta guía te ayudará a configurar completamente el sistema de notificaciones por email para tu aplicación TeeReserve, incluyendo emails de bienvenida, confirmaciones de reserva, recordatorios y más.

## 📋 Prerrequisitos

### 1. Cuenta de Zoho Mail
- Tener una cuenta de Zoho Mail activa
- Acceso al Zoho API Console
- Dominio personalizado configurado (opcional pero recomendado)

### 2. Variables de Entorno Requeridas
Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
# Zoho Mail Configuration
ZOHO_MAIL_CLIENT_ID=tu_client_id_aqui
ZOHO_MAIL_CLIENT_SECRET=tu_client_secret_aqui
ZOHO_MAIL_REFRESH_TOKEN=tu_refresh_token_aqui
ZOHO_MAIL_FROM=noreply@tudominio.com

# Firebase Configuration (ya configurado)
NEXT_PUBLIC_FIREBASE_APIKEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=tu_project_id
# ... otras variables de Firebase
```

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar Aplicación en Zoho API Console

1. **Acceder al Zoho API Console**
   - Ve a: https://api-console.zoho.com/
   - Inicia sesión con tu cuenta de Zoho

2. **Crear Nueva Aplicación**
   - Haz clic en "Add Client"
   - Selecciona "Server-based Applications"
   - Completa los datos:
     - **Client Name**: TeeReserve Email Service
     - **Homepage URL**: https://tudominio.com
     - **Authorized Redirect URIs**: https://tudominio.com/auth/callback

3. **Obtener Credenciales**
   - Copia el `Client ID` y `Client Secret`
   - Guárdalos en tu `.env.local`

### Paso 2: Generar Refresh Token

1. **Generar Grant Token**
   - Ve a: https://accounts.zoho.com/oauth/v2/auth
   - Usa esta URL (reemplaza CLIENT_ID):
   ```
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.Send.ALL&client_id=TU_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=https://tudominio.com/auth/callback
   ```
   - Autoriza la aplicación y copia el código de autorización

2. **Intercambiar por Refresh Token**
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "grant_type=authorization_code" \
     -d "client_id=TU_CLIENT_ID" \
     -d "client_secret=TU_CLIENT_SECRET" \
     -d "redirect_uri=https://tudominio.com/auth/callback" \
     -d "code=CODIGO_DE_AUTORIZACION"
   ```

3. **Guardar Refresh Token**
   - Copia el `refresh_token` de la respuesta
   - Añádelo a tu `.env.local`

### Paso 3: Configurar Dominio de Email (Opcional)

1. **Configurar Dominio en Zoho Mail**
   - Ve a Zoho Mail Admin Console
   - Añade tu dominio personalizado
   - Configura registros MX, SPF, DKIM

2. **Actualizar Variable de Entorno**
   ```env
   ZOHO_MAIL_FROM=noreply@tudominio.com
   ```

## 🧪 Verificar Configuración

### 1. Probar Envío de Email

Crea un archivo de prueba `test-email.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const { sendWelcomeEmail } = require('./src/ai/flows/send-welcome-email');

async function testEmail() {
  try {
    const result = await sendWelcomeEmail({
      email: 'tu-email@ejemplo.com',
      name: 'Usuario Test',
      userId: 'test-user-id'
    });
    console.log('✅ Email enviado exitosamente:', result);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
}

testEmail();
```

Ejecuta la prueba:
```bash
node test-email.js
```

### 2. Verificar en la Aplicación

1. **Registrar Nuevo Usuario**
   - Ve a `/signup`
   - Registra un nuevo usuario
   - Verifica que llegue el email de bienvenida

2. **Hacer una Reserva**
   - Completa una reserva
   - Verifica emails de confirmación

## 📧 Tipos de Emails Configurados

### 1. Email de Bienvenida
- **Trigger**: Registro de nuevo usuario
- **Template**: `src/ai/flows/send-welcome-email.ts`
- **Contenido**: Bienvenida, información de la cuenta

### 2. Confirmación de Reserva
- **Trigger**: Reserva completada
- **Template**: `src/ai/flows/send-booking-confirmation.ts`
- **Contenido**: Detalles de la reserva, información del campo

### 3. Recordatorio de Reserva
- **Trigger**: 24 horas antes de la reserva
- **Template**: `src/ai/flows/send-booking-reminder.ts`
- **Contenido**: Recordatorio, información del clima

### 4. Invitación a Reseña
- **Trigger**: Después de completar la ronda
- **Template**: `src/ai/flows/send-review-invitation.ts`
- **Contenido**: Invitación a dejar reseña

### 5. Email de Contacto
- **Trigger**: Formulario de contacto
- **Template**: `src/ai/flows/send-contact-email.ts`
- **Contenido**: Confirmación de mensaje recibido

## 🔧 Personalización de Templates

### Modificar Templates de Email

Los templates están en `src/ai/flows/`. Para personalizar:

1. **Editar Contenido**
   ```typescript
   // En send-welcome-email.ts
   const emailContent = `
     <h1>¡Bienvenido a TeeReserve, ${name}!</h1>
     <p>Tu cuenta ha sido creada exitosamente.</p>
     // Personaliza aquí...
   `;
   ```

2. **Añadir Nuevos Campos**
   ```typescript
   interface WelcomeEmailData {
     email: string;
     name: string;
     userId: string;
     // Añade nuevos campos aquí
     phoneNumber?: string;
     preferredCourse?: string;
   }
   ```

### Configurar Preferencias de Usuario

Los usuarios pueden configurar sus preferencias en `/profile`:

- Emails de marketing
- Recordatorios de reserva
- Invitaciones a reseñas
- Notificaciones de ofertas

## 🚨 Solución de Problemas

### Error: "Invalid Refresh Token"
**Solución**: Regenerar el refresh token siguiendo el Paso 2

### Error: "Authentication Failed"
**Solución**: Verificar Client ID y Client Secret

### Error: "Domain Not Verified"
**Solución**: Configurar registros DNS correctamente

### Emails No Llegan
**Verificar**:
1. Configuración SPF/DKIM
2. Carpeta de spam
3. Límites de envío de Zoho
4. Logs de la aplicación

### Error: "Rate Limit Exceeded"
**Solución**: Implementar cola de emails o esperar reset del límite

## 📊 Monitoreo y Analytics

### Logs de Email
Los logs se guardan en:
- Console de la aplicación
- Archivo de logs (si configurado)
- Zoho Mail logs

### Métricas Importantes
- Tasa de entrega
- Tasa de apertura
- Tasa de clics
- Bounces y quejas

## 🔒 Seguridad

### Mejores Prácticas
1. **Nunca** commitear tokens en el código
2. Usar variables de entorno para credenciales
3. Rotar tokens periódicamente
4. Monitorear uso de API
5. Implementar rate limiting

### Configuración de Firewall
```env
# Opcional: Restringir IPs
ZOHO_ALLOWED_IPS=tu.ip.servidor,otra.ip.permitida
```

## 📞 Soporte

Si tienes problemas:

1. **Revisar Logs**: Consulta los logs de la aplicación
2. **Documentación Zoho**: https://www.zoho.com/mail/help/
3. **Verificar Estado**: https://status.zoho.com/
4. **Contactar Soporte**: Si el problema persiste

## ✅ Checklist de Configuración

- [ ] Cuenta de Zoho Mail creada
- [ ] Aplicación en Zoho API Console configurada
- [ ] Client ID y Client Secret obtenidos
- [ ] Refresh Token generado
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado configurado (opcional)
- [ ] Registros DNS configurados
- [ ] Prueba de envío exitosa
- [ ] Email de bienvenida funcionando
- [ ] Emails de confirmación funcionando
- [ ] Preferencias de usuario configuradas
- [ ] Monitoreo implementado

¡Tu sistema de notificaciones por email está listo! 🎉