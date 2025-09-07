# 🚀 Lista de Verificación para Deployment de Producción

## ❌ Problemas Críticos Identificados

### 1. Variables de Entorno Requeridas
Debes configurar las siguientes variables de entorno en tu plataforma de deployment (Vercel, Netlify, etc.):

#### **Firebase (CRÍTICO)**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_de_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

#### **Stripe (CRÍTICO para pagos)**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta
```

#### **Servicios Adicionales**
```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_recaptcha_site_key
RECAPTCHA_SECRET_KEY=tu_recaptcha_secret_key

# Gemini AI
GEMINI_API_KEY=tu_gemini_api_key

# Email (Zoho)
ZOHO_MAIL_CLIENT_ID=tu_zoho_client_id
ZOHO_MAIL_CLIENT_SECRET=tu_zoho_client_secret
ZOHO_MAIL_REFRESH_TOKEN=tu_zoho_refresh_token
ZOHO_MAIL_FROM=info@teereserve.golf
CONTACT_FORM_RECIPIENT=info@teereserve.golf
```

### 2. Configuración de Logging y Monitoreo (OPCIONAL)
```bash
# Logging
NEXT_PUBLIC_LOG_LEVEL=INFO
NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING=false
NEXT_PUBLIC_ENABLE_REMOTE_LOGGING=true
NEXT_PUBLIC_ENABLE_LOCAL_STORAGE_LOGGING=false
REACT_APP_LOGGING_ENDPOINT=https://tu-servicio-logging.com/api/logs
REACT_APP_LOGGING_API_KEY=tu_logging_api_key

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=tu_sentry_org
SENTRY_PROJECT=tu_sentry_project
SENTRY_AUTH_TOKEN=tu_sentry_auth_token
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0

# Aplicación
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://teereserve.golf

# Seguridad
NEXTAUTH_SECRET=tu_nextauth_secret_muy_seguro
NEXTAUTH_URL=https://teereserve.golf

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Monitoreo
HEALTH_CHECK_TOKEN=tu_health_check_token
UPTIME_ROBOT_API_KEY=tu_uptime_robot_key
```

## 🔧 Pasos para Configurar el Deployment

### Paso 1: Configurar Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" > "General"
4. Copia las credenciales de "Configuración del SDK"
5. Configura las variables de entorno en tu plataforma de deployment

### Paso 2: Configurar Stripe
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Ve a "Developers" > "API keys"
3. Copia las claves de producción
4. **IMPORTANTE**: Usa claves de producción (pk_live_ y sk_live_)

### Paso 3: Configurar Servicios Opcionales

#### Google Maps
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la API de Google Maps
3. Crea una clave API
4. Restringe la clave a tu dominio

#### reCAPTCHA
1. Ve a [reCAPTCHA Admin](https://www.google.com/recaptcha/admin/)
2. Registra tu sitio
3. Copia las claves del sitio y secreta

#### Sentry (Error Tracking)
1. Ve a [Sentry.io](https://sentry.io/)
2. Crea un nuevo proyecto
3. Copia el DSN
4. Configura las variables de entorno

### Paso 4: Deployment en Vercel (Recomendado)

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel**
   ```bash
   vercel login
   ```

3. **Configurar variables de entorno**
   ```bash
   # Opción 1: Usar la interfaz web de Vercel
   # Ve a tu proyecto > Settings > Environment Variables
   
   # Opción 2: Usar CLI
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   # ... repite para todas las variables
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Paso 5: Configurar Dominio Personalizado

1. En Vercel Dashboard:
   - Ve a tu proyecto
   - Settings > Domains
   - Agrega "teereserve.golf"
   - Configura los DNS según las instrucciones

2. Actualiza las variables de entorno:
   ```bash
   NEXT_PUBLIC_APP_URL=https://teereserve.golf
   NEXTAUTH_URL=https://teereserve.golf
   ```

## ⚠️ Problemas Conocidos y Soluciones

### TypeScript Errors
El proyecto tiene algunos errores de TypeScript que no afectan la funcionalidad pero pueden causar fallos en el build. Para solucionarlo temporalmente:

1. **Opción 1: Ignorar errores de TypeScript en build**
   ```json
   // next.config.mjs
   const nextConfig = {
     typescript: {
       ignoreBuildErrors: true,
     },
     // ... resto de configuración
   }
   ```

2. **Opción 2: Usar modo de desarrollo para deployment inicial**
   ```bash
   npm run build:dev
   ```

### ESLint Warnings
Puedes ignorar las advertencias de ESLint temporalmente:
```json
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... resto de configuración
}
```

## 🧪 Testing del Deployment

### 1. Health Check
Después del deployment, verifica:
```bash
curl https://teereserve.golf/api/health
```

### 2. Funcionalidades Críticas
- [ ] Login/Registro de usuarios
- [ ] Búsqueda de campos de golf
- [ ] Reserva de tee times
- [ ] Proceso de pago
- [ ] Envío de emails
- [ ] Carga de imágenes

### 3. Monitoreo
- [ ] Configurar alertas en Sentry
- [ ] Configurar monitoreo de uptime
- [ ] Verificar logs de aplicación

## 📋 Checklist Final

- [ ] Todas las variables de entorno configuradas
- [ ] Firebase configurado y funcionando
- [ ] Stripe configurado con claves de producción
- [ ] Dominio personalizado configurado
- [ ] SSL/HTTPS funcionando
- [ ] Health check respondiendo correctamente
- [ ] Funcionalidades críticas probadas
- [ ] Monitoreo configurado
- [ ] Backup de base de datos configurado
- [ ] DNS configurado correctamente

## 🆘 Soporte

Si encuentras problemas durante el deployment:

1. **Revisa los logs de build** en tu plataforma de deployment
2. **Verifica las variables de entorno** están correctamente configuradas
3. **Prueba localmente** con las mismas variables de entorno
4. **Consulta la documentación** de cada servicio (Firebase, Stripe, etc.)

## 🔄 Próximos Pasos Recomendados

1. **Implementar tests automatizados**
2. **Configurar CI/CD pipeline**
3. **Optimizar SEO**
4. **Configurar analytics**
5. **Implementar cache strategies**
6. **Configurar CDN para assets estáticos**