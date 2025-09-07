# 🚀 Guía Completa de Deploy - TeeReserve Golf

## 📋 Tabla de Contenidos
1. [Configuración de Google Maps API](#configuración-de-google-maps-api)
2. [Configuración de Twilio SMS](#configuración-de-twilio-sms)
3. [Configuración de n8n Webhooks](#configuración-de-n8n-webhooks)
4. [Variables de Entorno](#variables-de-entorno)
5. [Deploy Local](#deploy-local)
6. [Deploy a Firebase Hosting](#deploy-a-firebase-hosting)
7. [Deploy a Firebase App Hosting](#deploy-a-firebase-app-hosting)
8. [Configuración de Secretos en Firebase](#configuración-de-secretos-en-firebase)
9. [Verificación Post-Deploy](#verificación-post-deploy)
10. [Troubleshooting](#troubleshooting)

---

## 🗺️ Configuración de Google Maps API

### Paso 1: Crear/Configurar el Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Places API** (opcional, para funcionalidades futuras)
   - **Geocoding API** (opcional, para conversión de direcciones)

### Paso 2: Crear una API Key

1. Ve a **APIs & Services > Credentials**
2. Haz clic en **+ CREATE CREDENTIALS > API Key**
3. Copia la API Key generada

### Paso 3: Configurar Restricciones de la API Key

1. Haz clic en la API Key recién creada
2. En **Application restrictions**, selecciona **HTTP referrers (web sites)**
3. Agrega los siguientes dominios:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   https://teereserve-golf.web.app/*
   https://teereserve-golf.firebaseapp.com/*
   https://tu-dominio-personalizado.com/*
   ```
4. En **API restrictions**, selecciona **Restrict key** y elige:
   - Maps JavaScript API
   - Places API (si la habilitaste)
   - Geocoding API (si la habilitaste)

### Paso 4: Actualizar .env.local

```bash
# Reemplaza con tu API Key real
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## 📱 Configuración de Twilio SMS

### Paso 1: Crear Cuenta en Twilio

1. Ve a [Twilio Console](https://console.twilio.com/)
2. Crea una cuenta o inicia sesión
3. Verifica tu número de teléfono

### Paso 2: Obtener Credenciales

1. En el Dashboard, encuentra:
   - **Account SID**: Tu identificador único de cuenta
   - **Auth Token**: Token de autenticación (mantén secreto)

### Paso 3: Comprar un Número de Teléfono

1. Ve a **Phone Numbers > Manage > Buy a number**
2. Selecciona un número con capacidades SMS
3. Completa la compra

### Paso 4: Configurar Variables de Entorno

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Paso 5: Configurar Webhook de Estado (Opcional)

1. Ve a **Phone Numbers > Manage > Active numbers**
2. Selecciona tu número
3. En **Messaging**, configura:
   - **Webhook URL**: `https://tu-dominio.com/api/webhooks/sms-status`
   - **HTTP Method**: POST

---

## 🔗 Configuración de n8n Webhooks

### Paso 1: Configurar n8n

1. **Opción A: n8n Cloud**
   - Ve a [n8n.cloud](https://n8n.cloud/)
   - Crea una cuenta
   - Crea un nuevo workflow

2. **Opción B: Self-hosted**
   ```bash
   # Docker
   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   
   # npm
   npm install n8n -g
   n8n start
   ```

### Paso 2: Crear Webhook en n8n

1. Crea un nuevo workflow
2. Agrega un nodo **Webhook**
3. Configura:
   - **HTTP Method**: POST
   - **Path**: `/webhook/teereserve`
   - **Authentication**: Header Auth
   - **Header Name**: `x-webhook-secret`

### Paso 3: Configurar Automatizaciones

**Ejemplo de Workflow para Nuevos Usuarios:**
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "/webhook/teereserve",
        "httpMethod": "POST",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Filter New Users",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.eventType}}",
              "value2": "user.created"
            }
          ]
        }
      }
    },
    {
      "name": "Send to CRM",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.your-crm.com/contacts",
        "method": "POST",
        "body": {
          "email": "={{$json.userData.email}}",
          "name": "={{$json.userData.name}}",
          "source": "TeeReserve Golf"
        }
      }
    }
  ]
}
```

### Paso 4: Configurar Variables de Entorno

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/teereserve
WEBHOOK_SECRET=your_secure_secret_key_here
```

### Paso 5: Eventos Disponibles

La aplicación envía los siguientes eventos:

- `user.created` - Nuevo usuario registrado
- `booking.created` - Nueva reserva creada
- `booking.cancelled` - Reserva cancelada
- `payment.completed` - Pago completado
- `review.created` - Nueva reseña creada

---

## 🔧 Variables de Entorno

### Archivo .env.local (Desarrollo)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAGbLMGcxSRumk--pywW6PvytcTwRn4j1E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teereserve-golf.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://teereserve-golf-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teereserve-golf
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=teereserve-golf.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=502212139547
NEXT_PUBLIC_FIREBASE_APP_ID=1:502212139547:web:37ebd5c12071689b20b6be
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HYV3VCD0WW
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-firebase-vapid-key

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=teereserve-golf
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@teereserve-golf.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...

# Genkit / Gemini AI
GEMINI_API_KEY=AIzaSy...

# Email Configuration (Zoho)
ZOHO_MAIL_CLIENT_ID=1000...
ZOHO_MAIL_CLIENT_SECRET=c78be4a...
ZOHO_MAIL_REFRESH_TOKEN=your-refresh-token
ZOHO_MAIL_FROM=info@teereserve.golf
CONTACT_FORM_RECIPIENT=info@teereserve.golf

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Webhook Configuration (n8n)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/teereserve
WEBHOOK_SECRET=your_secure_webhook_secret_key
```

---

## 💻 Deploy Local

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn
- Firebase CLI instalado globalmente

### Pasos

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus valores reales
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Build para producción:**
   ```bash
   npm run build
   ```

5. **Ejecutar build localmente:**
   ```bash
   npm start
   ```

---

## 🔥 Deploy a Firebase Hosting

### Paso 1: Preparar el Build

```bash
# Limpiar build anterior (si hay problemas)
rm -rf .next

# Crear build de producción
npm run build
```

### Paso 2: Deploy a Hosting

```bash
# Deploy solo hosting
firebase deploy --only hosting

# O deploy completo (hosting + functions + firestore)
firebase deploy
```

### Paso 3: Verificar Deploy

- URL de producción: `https://teereserve-golf.web.app`
- Consola Firebase: `https://console.firebase.google.com/project/teereserve-golf`

---

## 🚀 Deploy a Firebase App Hosting

### Configuración en apphosting.yaml

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
runConfig:
  maxInstances: 1
  env:
    - variable: STRIPE_SECRET_KEY
      secret: STRIPE_SECRET_KEY
    - variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      secret: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    - variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      secret: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    - variable: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      secret: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    - variable: RECAPTCHA_SECRET_KEY
      secret: RECAPTCHA_SECRET_KEY
    - variable: GEMINI_API_KEY
      secret: GEMINI_API_KEY
    - variable: NEXT_PUBLIC_FIREBASE_API_KEY
      secret: NEXT_PUBLIC_FIREBASE_API_KEY
    - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      secret: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    - variable: NEXT_PUBLIC_FIREBASE_DATABASE_URL
      secret: NEXT_PUBLIC_FIREBASE_DATABASE_URL
    - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
      secret: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      secret: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      secret: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    - variable: NEXT_PUBLIC_FIREBASE_APP_ID
      secret: NEXT_PUBLIC_FIREBASE_APP_ID
    - variable: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      secret: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    - variable: FIREBASE_PROJECT_ID
      secret: FIREBASE_PROJECT_ID
    - variable: FIREBASE_CLIENT_EMAIL
      secret: FIREBASE_CLIENT_EMAIL
    - variable: FIREBASE_PRIVATE_KEY
      secret: FIREBASE_PRIVATE_KEY
    - variable: ZOHO_MAIL_CLIENT_ID
      secret: ZOHO_MAIL_CLIENT_ID
    - variable: ZOHO_MAIL_CLIENT_SECRET
      secret: ZOHO_MAIL_CLIENT_SECRET
    - variable: ZOHO_MAIL_REFRESH_TOKEN
      secret: ZOHO_MAIL_REFRESH_TOKEN
    - variable: ZOHO_MAIL_FROM
      secret: ZOHO_MAIL_FROM
    - variable: CONTACT_FORM_RECIPIENT
      secret: CONTACT_FORM_RECIPIENT
    - variable: TWILIO_ACCOUNT_SID
      secret: TWILIO_ACCOUNT_SID
    - variable: TWILIO_AUTH_TOKEN
      secret: TWILIO_AUTH_TOKEN
    - variable: TWILIO_PHONE_NUMBER
      secret: TWILIO_PHONE_NUMBER
    - variable: N8N_WEBHOOK_URL
      secret: N8N_WEBHOOK_URL
    - variable: WEBHOOK_SECRET
      secret: WEBHOOK_SECRET
```

---

## 🔐 Configuración de Secretos en Firebase

### Usando Firebase CLI

```bash
# Configurar secretos uno por uno
firebase apphosting:secrets:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
firebase apphosting:secrets:set STRIPE_SECRET_KEY
firebase apphosting:secrets:set GEMINI_API_KEY
# ... continúa con todos los secretos
```

### Usando Google Cloud Console

1. Ve a [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Crea un nuevo secreto para cada variable de entorno
3. Asigna los valores correspondientes

---

## ✅ Verificación Post-Deploy

### Checklist de Verificación

- [ ] **Página principal carga correctamente**
- [ ] **Autenticación funciona (login/signup)**
- [ ] **Mapas de Google se muestran sin errores**
- [ ] **Búsqueda de campos funciona**
- [ ] **Proceso de reserva completo funciona**
- [ ] **Pagos con Stripe funcionan**
- [ ] **Panel de administración accesible**
- [ ] **Formulario de contacto envía emails**
- [ ] **PWA se instala correctamente**
- [ ] **Sistema de notificaciones funciona:**
  - [ ] Email de bienvenida se envía al registrarse
  - [ ] Notificaciones in-app aparecen correctamente
  - [ ] Preferencias de notificación se guardan
  - [ ] SMS de prueba se envía (si configurado)
- [ ] **Webhooks funcionan:**
  - [ ] Eventos se envían a n8n correctamente
  - [ ] Endpoint `/api/webhooks` responde
  - [ ] Autenticación de webhook funciona

### URLs de Prueba

```
# Producción
https://teereserve-golf.web.app
https://teereserve-golf.web.app/en/courses
https://teereserve-golf.web.app/en/admin

# Desarrollo
http://localhost:3001
http://localhost:3001/en/courses
http://localhost:3001/en/admin
```

---

## 🔧 Troubleshooting

### Error: "Google Maps API Key not found"

**Solución:**
1. Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté en `.env.local`
2. Reinicia el servidor de desarrollo
3. Verifica que la API Key tenga permisos para Maps JavaScript API

### Error: "Build failed - Module not found"

**Solución:**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar build de Next.js
rm -rf .next
npm run build
```

### Error: "Firebase deploy failed"

**Solución:**
```bash
# Verificar autenticación
firebase login

# Verificar proyecto activo
firebase use teereserve-golf

# Deploy solo hosting si hay problemas con functions
firebase deploy --only hosting
```

### Error: "Firestore indexes conflict"

**Solución:**
1. Ve a [Firestore Console](https://console.firebase.google.com/project/teereserve-golf/firestore/indexes)
2. Elimina índices duplicados
3. Actualiza `firestore.indexes.json`
4. Redeploy: `firebase deploy --only firestore:indexes`

### Error: "Maps not loading in production"

**Solución:**
1. Verifica que el dominio de producción esté en las restricciones de la API Key
2. Agrega `https://teereserve-golf.web.app/*` a los HTTP referrers
3. Espera 5-10 minutos para que los cambios se propaguen

### Error: "SMS not sending - Twilio authentication failed"

**Solución:**
1. Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
2. Confirma que el número de teléfono esté en formato internacional (+1234567890)
3. Verifica que tu cuenta Twilio tenga crédito suficiente
4. Para cuentas trial, verifica que el número destino esté verificado

### Error: "Webhook not receiving data from n8n"

**Solución:**
1. Verifica que `N8N_WEBHOOK_URL` sea la URL correcta
2. Confirma que `WEBHOOK_SECRET` coincida en ambos sistemas
3. Verifica que el endpoint `/api/webhooks` esté accesible
4. Revisa los logs de n8n para errores de conexión

### Error: "SMS rate limit exceeded"

**Solución:**
1. Implementa rate limiting en tu aplicación
2. Verifica los límites de tu plan Twilio
3. Considera upgrading tu cuenta Twilio si es necesario
4. Implementa cola de mensajes para SMS no críticos

---

## 📞 Soporte

Si encuentras problemas durante el deploy:

1. **Revisa los logs:**
   ```bash
   # Logs de Firebase
   firebase functions:log
   
   # Logs de desarrollo
   npm run dev
   ```

2. **Verifica la configuración:**
   - Variables de entorno
   - Permisos de APIs
   - Configuración de Firebase

3. **Contacta al equipo de desarrollo** con:
   - Descripción del error
   - Logs relevantes
   - Pasos para reproducir el problema

---

**¡Deploy exitoso! 🎉**

Tu aplicación TeeReserve Golf está ahora disponible en producción.