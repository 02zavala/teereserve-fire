# 🚀 Instrucciones Completas de Deploy - TeeReserve Golf

## ✅ Deploy Completado Exitosamente

**URL de Producción:** https://teereserve-golf.web.app
**Console de Firebase:** https://console.firebase.google.com/project/teereserve-golf/overview

---

## 🔐 Configuración de Variables de Entorno en Firebase

### Método 1: Usando Firebase CLI (Recomendado)

```bash
# 1. Asegúrate de estar autenticado
firebase login

# 2. Selecciona el proyecto correcto
firebase use teereserve-golf

# 3. Configura cada variable de entorno como secreto
firebase apphosting:secrets:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
firebase apphosting:secrets:set STRIPE_SECRET_KEY
firebase apphosting:secrets:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
firebase apphosting:secrets:set GEMINI_API_KEY
firebase apphosting:secrets:set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
firebase apphosting:secrets:set RECAPTCHA_SECRET_KEY
firebase apphosting:secrets:set PAYPAL_CLIENT_SECRET
firebase apphosting:secrets:set NEXT_PUBLIC_PAYPAL_CLIENT_ID
firebase apphosting:secrets:set RESEND_API_KEY
firebase apphosting:secrets:set ZOHO_MAIL_CLIENT_SECRET
firebase apphosting:secrets:set ZOHO_MAIL_REFRESH_TOKEN
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
```

### Método 2: Usando Google Cloud Console

1. Ve a [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=teereserve-golf)
2. Haz clic en "+ CREATE SECRET"
3. Crea cada secreto con los siguientes nombres y valores:

#### Secretos Críticos a Configurar:

**🗺️ Google Maps API**
- Nombre: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Valor: `AIzaSyCuwWBkAFgM5JM4KJyJThWoMifxwJOmQdY`

**💳 Stripe**
- Nombre: `STRIPE_SECRET_KEY`
- Valor: `sk_test_[TU_CLAVE_SECRETA_DE_STRIPE]`
- Nombre: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Valor: `pk_test_[TU_CLAVE_PUBLICA_DE_STRIPE]`

**🤖 Gemini AI**
- Nombre: `GEMINI_API_KEY`
- Valor: `AIzaSyBWlMT83C4lyIgtC-bMbvJfeM3_GmyDT2Q`

**🛡️ reCAPTCHA**
- Nombre: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Valor: `6LeDXa4rAAAAAKfhtBqKNw7ozlLW2lSJbz7IjURI`
- Nombre: `RECAPTCHA_SECRET_KEY`
- Valor: `6LeDXa4rAAAAAEa8FIgEsBzpxp5ovNR5CKJGzH07`

**💰 PayPal**
- Nombre: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- Valor: `AVOpS3SeN94ptRkTzeHpVDApChOD9qv2XpGTRZNXtvujY-7oyM-1mSiLRnlF8FcflAS3m3pb72sv3kR-`
- Nombre: `PAYPAL_CLIENT_SECRET`
- Valor: `EPKNenzk14NYj4RgP7PqbagzH0Cfo5LsdNlLyPPgFGwFfMyFOYJaQHaSz0mZeJaNpvEDus0wzT179sk1`

**📧 Email (Resend)**
- Nombre: `RESEND_API_KEY`
- Valor: `re_BAJBSUSE_9DWRL9hU1Fm6BuUBqjEPQcX1`

**📧 Email Backup (Zoho)**
- Nombre: `ZOHO_MAIL_CLIENT_SECRET`
- Valor: `c78be4a08b890d11c548608500b79accc00065d1c1`
- Nombre: `ZOHO_MAIL_REFRESH_TOKEN`
- Valor: `1000.c5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5.c5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5`

**🔥 Firebase Admin**
- Nombre: `FIREBASE_PRIVATE_KEY`
- Valor: (La clave privada completa de tu .env.local)

---

## 🗺️ Configuración Específica de Google Maps API

### 1. Verificar Restricciones de Dominio

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Busca tu API Key: `AIzaSyCuwWBkAFgM5JM4KJyJThWoMifxwJOmQdY`
3. Haz clic en el ícono de editar (lápiz)
4. En "Application restrictions", selecciona "HTTP referrers (web sites)"
5. Agrega estos dominios:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   https://teereserve-golf.web.app/*
   https://teereserve-golf.firebaseapp.com/*
   https://ssrteereservegolf-nfoa7sv3va-uc.a.run.app/*
   ```

### 2. Verificar APIs Habilitadas

Asegúrate de que estas APIs estén habilitadas:
- ✅ Maps JavaScript API
- ✅ Places API (opcional)
- ✅ Geocoding API (opcional)

### 3. Verificar Facturación

- Asegúrate de que tu proyecto tenga una cuenta de facturación activa
- Google Maps requiere facturación habilitada para funcionar en producción

---

## 🔄 Redeploy Después de Configurar Secretos

Después de configurar todos los secretos, haz un redeploy:

```bash
# Redeploy completo
firebase deploy

# O solo el hosting si no hay cambios en functions
firebase deploy --only hosting
```

---

## ✅ Verificación Post-Deploy

### URLs de Prueba:
- **Página Principal:** https://teereserve-golf.web.app
- **Cursos:** https://teereserve-golf.web.app/en/courses
- **Admin:** https://teereserve-golf.web.app/en/admin

### Checklist de Verificación:
- [ ] **Página principal carga sin errores**
- [ ] **Google Maps se muestra correctamente**
- [ ] **Autenticación funciona (login/signup)**
- [ ] **Búsqueda de campos funciona**
- [ ] **Proceso de reserva funciona**
- [ ] **Pagos con Stripe funcionan**
- [ ] **Panel de administración accesible**
- [ ] **Formulario de contacto envía emails**
- [ ] **Precios dinámicos se muestran correctamente**

---

## 🔧 Troubleshooting Común

### Error: "Google Maps API Key not found"
**Solución:**
1. Verifica que el secreto `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté configurado
2. Haz un redeploy: `firebase deploy`
3. Verifica las restricciones de dominio en Google Cloud Console

### Error: "Maps not loading in production"
**Solución:**
1. Agrega `https://teereserve-golf.web.app/*` a los HTTP referrers
2. Verifica que la facturación esté habilitada
3. Revisa la consola del navegador para errores específicos

### Error: "Payment processing failed"
**Solución:**
1. Verifica que los secretos de Stripe estén configurados
2. Para producción, cambia a live keys en lugar de test keys
3. Configura webhooks de Stripe apuntando a tu dominio

---

## 📝 Notas Importantes

1. **Todas las variables que empiezan con `NEXT_PUBLIC_` deben configurarse como secretos**
2. **Las variables privadas (sin `NEXT_PUBLIC_`) también deben configurarse como secretos**
3. **Después de configurar secretos, siempre haz un redeploy**
4. **Para producción, cambia todas las keys de test a live keys**
5. **Verifica que la facturación esté habilitada en Google Cloud para Maps API**

---

## 🎉 ¡Deploy Completado!

Tu aplicación TeeReserve Golf está ahora desplegada en:
**https://teereserve-golf.web.app**

Sigue las instrucciones anteriores para configurar las variables de entorno y asegurar que todas las funcionalidades trabajen correctamente en producción.