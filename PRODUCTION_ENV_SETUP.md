# Configuración de Variables de Entorno para Producción

## Variables Críticas que Requieren Configuración para Producción

### 🔥 Firebase (Requerido)
```bash
# Configuración de Firebase para producción
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_production_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### 💳 Stripe (Requerido para Pagos)
```bash
# Cambiar de test keys a live keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

### 📧 Email Services (Requerido)
```bash
# Resend (Principal)
RESEND_API_KEY=re_your_production_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Zoho Mail (Backup)
ZOHO_MAIL_CLIENT_ID=your_production_client_id
ZOHO_MAIL_CLIENT_SECRET=your_production_client_secret
ZOHO_MAIL_REFRESH_TOKEN=your_production_refresh_token
ZOHO_MAIL_FROM=noreply@yourdomain.com
```

### 🗺️ Google Maps (Requerido)
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_key
```

### 🛡️ reCAPTCHA (Requerido para Seguridad)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_production_site_key
RECAPTCHA_SECRET_KEY=your_production_secret_key
```

### 🌐 URLs de Producción
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 🔧 Configuración de Entorno
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### 💰 PayPal (Opcional - Requiere Credenciales Válidas)
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_production_paypal_client_id
PAYPAL_CLIENT_SECRET=your_production_paypal_secret
PAYPAL_ENVIRONMENT=live
```

### 📊 Monitoreo y Logging (Recomendado)
```bash
# Sentry para monitoreo de errores
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
SENTRY_ORG=your_organization
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token

# Logging
LOG_LEVEL=info
ENABLE_LOGGING=true
```

### 🔒 Seguridad
```bash
# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Health Check
HEALTH_CHECK_TOKEN=your_secure_random_token
```

## ✅ Checklist de Configuración

### Antes del Despliegue:
- [ ] Todas las variables de Firebase configuradas para producción
- [ ] Stripe configurado con live keys
- [ ] Dominio verificado en Resend
- [ ] Google Maps API key con restricciones de dominio
- [ ] reCAPTCHA configurado para el dominio de producción
- [ ] URLs base actualizadas
- [ ] PayPal configurado (si se usa)
- [ ] Sentry configurado para monitoreo
- [ ] Variables de seguridad configuradas

### Verificaciones Post-Despliegue:
- [ ] Probar registro/login de usuarios
- [ ] Probar envío de emails
- [ ] Probar proceso de pago completo
- [ ] Verificar que Google Maps funcione
- [ ] Probar formularios con reCAPTCHA
- [ ] Verificar que Sentry capture errores
- [ ] Probar funcionalidades críticas

## 🚨 Notas Importantes

1. **Nunca commitear credenciales de producción** al repositorio
2. **Usar variables de entorno** en el proveedor de hosting
3. **Verificar dominios** en todos los servicios antes del despliegue
4. **Configurar webhooks** de Stripe para el dominio de producción
5. **Probar en staging** antes de producción
6. **Tener backups** de todas las configuraciones

## 🔧 Comandos de Verificación

```bash
# Verificar configuración de email
node scripts/test-resend-email.js

# Verificar configuración de Stripe
node scripts/test-stripe-payments.js

# Verificar configuración de PayPal (opcional)
node scripts/test-paypal-payments.js
```

## 📞 Soporte

Si encuentras problemas durante la configuración:
1. Revisa los logs de la aplicación
2. Verifica que todas las variables estén configuradas
3. Confirma que los dominios estén verificados en todos los servicios
4. Prueba cada servicio individualmente