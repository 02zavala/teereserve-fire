# 🚀 Guía de Deployment - TeeReserve Firebase Hosting

Esta guía documenta el proceso completo de deployment de TeeReserve en Firebase Hosting con Next.js 15.

## 📋 Prerequisitos

### Software Requerido
- **Node.js 20+** - Runtime para Next.js y Firebase Functions
- **npm** - Gestor de paquetes
- **Firebase CLI** - Herramientas de línea de comandos de Firebase

### Instalación de Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Verificar Configuración
```bash
firebase projects:list
node --version  # Debe ser 20+
npm --version
```

## 🔧 Configuración

### 1. Archivos de Configuración

#### `firebase.json`
- Configurado para Next.js 15 con App Router
- SSR habilitado con Cloud Functions
- Redirects HTTPS automáticos
- Configuración de headers de seguridad

#### `apphosting.yaml`
- Runtime Node.js 20
- Configuración optimizada de memoria y CPU
- Variables de entorno mapeadas a Firebase Secrets

#### `next.config.mjs`
- Output standalone para Firebase
- Optimizaciones de build
- Configuración de seguridad

### 2. Variables de Entorno

Las siguientes variables deben estar configuradas en `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HYV3VCD0WW
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=
PAYPAL_WEBHOOK_ID=
PAYPAL_WEBHOOK_URL=

# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=

# Security
JWT_SECRET=

# Email
RESEND_API_KEY=
EMAIL_FROM=
CONTACT_FORM_RECIPIENT=

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# AI
GEMINI_API_KEY=

# Zoho Mail
ZOHO_MAIL_CLIENT_ID=
ZOHO_MAIL_CLIENT_SECRET=
ZOHO_MAIL_REFRESH_TOKEN=
ZOHO_MAIL_FROM=
```

## 🚀 Comandos de Deployment

### Deployment Completo (Recomendado)
```bash
npm run deploy
```
Este comando ejecuta el script automatizado que:
1. Verifica prerequisitos
2. Instala dependencias
3. Ejecuta linting y verificaciones
4. Construye el proyecto
5. Configura variables de entorno
6. Valida assets
7. Despliega a Firebase
8. Ejecuta verificaciones post-deployment

### Comandos Individuales

#### Configurar Variables de Entorno
```bash
npm run firebase:config
```

#### Solo Deployment
```bash
npm run firebase:deploy
```

#### Deployment a Canal de Staging
```bash
npm run deploy:staging
```

#### Deployment a Canal de Preview
```bash
npm run deploy:preview
```

#### Build Local
```bash
npm run build
```

## 📁 Estructura de Archivos

```
teereserve-fire/
├── firebase.json              # Configuración de Firebase Hosting
├── apphosting.yaml           # Configuración de Cloud Functions
├── next.config.mjs           # Configuración de Next.js
├── .env.local               # Variables de entorno (no commitear)
├── scripts/
│   ├── configure-firebase-env.js  # Script de configuración de variables
│   └── deploy.js                  # Script de deployment automatizado
├── src/
│   └── lib/
│       └── analytics.ts           # Configuración de Analytics
└── public/
    ├── manifest.json              # PWA Manifest
    ├── favicon.ico               # Favicon
    └── icons/                    # Iconos de la aplicación
        ├── icon-192x192.png
        └── icon-512x512.png
```

## 🔍 Verificaciones Post-Deployment

### Automáticas
- ✅ Build exitoso
- ✅ Deployment sin errores
- ✅ Assets públicos accesibles
- ✅ Variables de entorno configuradas

### Manuales Recomendadas
1. **Funcionalidad Básica**
   - [ ] La aplicación carga correctamente
   - [ ] Navegación entre páginas funciona
   - [ ] Imágenes y assets se cargan

2. **Autenticación**
   - [ ] Registro de usuarios
   - [ ] Inicio de sesión
   - [ ] Cierre de sesión

3. **Reservas**
   - [ ] Búsqueda de campos de golf
   - [ ] Proceso de reserva
   - [ ] Integración con Stripe/PayPal

4. **Formularios**
   - [ ] Formulario de contacto
   - [ ] Validaciones funcionan
   - [ ] Envío de emails

5. **Analytics**
   - [ ] Firebase Analytics activo
   - [ ] Google Analytics 4 funcionando
   - [ ] Eventos personalizados registrándose

## 🌐 URLs de Producción

Después del deployment, la aplicación estará disponible en:
- **URL Principal**: `https://[PROJECT_ID].web.app`
- **URL Alternativa**: `https://[PROJECT_ID].firebaseapp.com`
- **Dominio Personalizado**: `https://teereserve.golf` (si está configurado)

## 🔧 Troubleshooting

### Errores Comunes

#### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

#### Error: "Not authenticated"
```bash
firebase login
```

#### Error: "Build failed"
1. Verificar variables de entorno en `.env.local`
2. Ejecutar `npm run lint` para verificar errores
3. Ejecutar `npm run typecheck` para errores de TypeScript

#### Error: "Functions deployment failed"
1. Verificar que Node.js sea versión 20+
2. Verificar configuración en `apphosting.yaml`
3. Revisar logs en Firebase Console

### Logs y Monitoreo

#### Ver Logs de Functions
```bash
firebase functions:log
```

#### Ver Logs en Firebase Console
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto
3. Ir a "Functions" > "Logs"

#### Monitoreo de Performance
- Firebase Performance Monitoring
- Google Analytics 4 Dashboard
- Firebase Analytics Console

## 📊 Configuración de Analytics

### Firebase Analytics
- Configurado automáticamente con el SDK
- Eventos personalizados para reservas
- Tracking de conversiones

### Google Analytics 4
- ID: `G-HYV3VCD0WW`
- Configuración de privacidad habilitada
- Integración con Firebase Analytics

### Eventos Personalizados
- `reservation_started` - Inicio de reserva
- `reservation_completed` - Reserva completada
- `course_viewed` - Campo de golf visualizado
- `search_performed` - Búsqueda realizada
- `user_registered` - Usuario registrado

## 🔒 Seguridad

### Headers de Seguridad
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy configurado

### HTTPS
- Forzado en todas las requests
- Redirect automático de HTTP a HTTPS
- Redirect de www a dominio principal

### Variables de Entorno
- Almacenadas como Firebase Secrets
- No expuestas en el código cliente
- Rotación regular recomendada

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en Firebase Console
2. Verificar configuración de variables de entorno
3. Consultar documentación de Firebase Hosting
4. Contactar al equipo de desarrollo

---

**Última actualización**: $(date)
**Versión**: Next.js 15 + Firebase Hosting
**Entorno**: Node.js 20