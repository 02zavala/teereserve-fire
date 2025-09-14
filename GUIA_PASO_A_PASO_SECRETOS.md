# 🔐 Guía Paso a Paso: Configurar Secretos en Firebase

## 📋 Preparación

### 1. Verificar que estés autenticado en Firebase
```bash
firebase login
```

### 2. Verificar que estés en el proyecto correcto
```bash
firebase use teereserve-golf
```

---

## 🚀 Método Recomendado: Firebase CLI

### Paso 1: Configurar Google Maps API
```bash
firebase apphosting:secrets:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
**Cuando te pida el valor, ingresa:** `AIzaSyCuwWBkAFgM5JM4KJyJThWoMifxwJOmQdY`

### Paso 2: Configurar Stripe
```bash
# Clave pública de Stripe
firebase apphosting:secrets:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
**Valor:** `pk_test_[TU_CLAVE_PUBLICA_DE_STRIPE]`

```bash
# Clave secreta de Stripe
firebase apphosting:secrets:set STRIPE_SECRET_KEY
```
**Valor:** `sk_test_[TU_CLAVE_SECRETA_DE_STRIPE]`

### Paso 3: Configurar reCAPTCHA
```bash
# Clave pública de reCAPTCHA
firebase apphosting:secrets:set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
```
**Valor:** `6LeDXa4rAAAAAKfhtBqKNw7ozlLW2lSJbz7IjURI`

```bash
# Clave secreta de reCAPTCHA
firebase apphosting:secrets:set RECAPTCHA_SECRET_KEY
```
**Valor:** `6LeDXa4rAAAAAEa8FIgEsBzpxp5ovNR5CKJGzH07`

### Paso 4: Configurar Gemini AI
```bash
firebase apphosting:secrets:set GEMINI_API_KEY
```
**Valor:** `AIzaSyBWlMT83C4lyIgtC-bMbvJfeM3_GmyDT2Q`

### Paso 5: Configurar PayPal
```bash
# Cliente ID de PayPal
firebase apphosting:secrets:set NEXT_PUBLIC_PAYPAL_CLIENT_ID
```
**Valor:** `AVOpS3SeN94ptRkTzeHpVDApChOD9qv2XpGTRZNXtvujY-7oyM-1mSiLRnlF8FcflAS3m3pb72sv3kR-`

```bash
# Secreto de PayPal
firebase apphosting:secrets:set PAYPAL_CLIENT_SECRET
```
**Valor:** `EPKNenzk14NYj4RgP7PqbagzH0Cfo5LsdNlLyPPgFGwFfMyFOYJaQHaSz0mZeJaNpvEDus0wzT179sk1`

### Paso 6: Configurar Firebase Admin
```bash
firebase apphosting:secrets:set FIREBASE_PROJECT_ID
```
**Valor:** `teereserve-golf`

```bash
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL
```
**Valor:** `firebase-adminsdk-fbsvc@teereserve-golf.iam.gserviceaccount.com`

```bash
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
```
**Valor:** (Copia toda la clave privada de tu .env.local, incluyendo las comillas y saltos de línea)

### Paso 7: Configurar Variables de Firebase (Públicas)
```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
```
**Valor:** `AIzaSyAGbLMGcxSRumk--pywW6PvytcTwRn4j1E`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
**Valor:** `teereserve-golf.firebaseapp.com`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
**Valor:** `teereserve-golf`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
**Valor:** `teereserve-golf.firebasestorage.app`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
**Valor:** `502212139547`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_APP_ID
```
**Valor:** `1:502212139547:web:37ebd5c12071689b20b6be`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
**Valor:** `G-HYV3VCD0WW`

---

## 🔄 Después de Configurar Todos los Secretos

### 1. Hacer Redeploy
```bash
firebase deploy
```

### 2. Verificar que la aplicación funcione
Ve a: https://teereserve-golf.web.app

---

## 🌐 Método Alternativo: Google Cloud Console

Si prefieres usar la interfaz web:

1. Ve a [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=teereserve-golf)
2. Haz clic en "+ CREATE SECRET"
3. Para cada secreto:
   - **Name:** Usa exactamente el nombre de la variable (ej: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
   - **Secret value:** Pega el valor correspondiente
   - Haz clic en "CREATE SECRET"

---

## 🗺️ Configuración Adicional para Google Maps

### 1. Configurar Restricciones de Dominio
1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Busca tu API Key: `AIzaSyCuwWBkAFgM5JM4KJyJThWoMifxwJOmQdY`
3. Haz clic en el ícono de editar (lápiz)
4. En "Application restrictions":
   - Selecciona "HTTP referrers (web sites)"
   - Agrega estos dominios:
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     https://teereserve.golf/*
     https://teereserve-golf.web.app/*
     https://teereserve-golf.firebaseapp.com/*
     https://ssrteereservegolf-nfoa7sv3va-uc.a.run.app/*
     ```
5. En "API restrictions":
   - Selecciona "Restrict key"
   - Marca: Maps JavaScript API, Places API, Geocoding API
6. Haz clic en "SAVE"

### 2. Verificar Facturación
1. Ve a [Google Cloud Console - Billing](https://console.cloud.google.com/billing)
2. Asegúrate de que tu proyecto tenga una cuenta de facturación activa
3. Google Maps requiere facturación para funcionar en producción

---

## ✅ Lista de Verificación

Marca cada paso cuando lo completes:

- [ ] Autenticado en Firebase CLI
- [ ] Proyecto correcto seleccionado (teereserve-golf)
- [ ] Google Maps API Key configurado
- [ ] Stripe keys configurados
- [ ] reCAPTCHA keys configurados
- [ ] Gemini AI key configurado
- [ ] PayPal keys configurados
- [ ] Firebase Admin keys configurados
- [ ] Firebase public keys configurados
- [ ] Redeploy realizado
- [ ] Restricciones de Google Maps configuradas
- [ ] Facturación de Google Cloud verificada
- [ ] Aplicación funcionando en https://teereserve-golf.web.app

---

## 🆘 Si Tienes Problemas

### Error: "Command not found: firebase"
```bash
npm install -g firebase-tools
```

### Error: "Not authenticated"
```bash
firebase logout
firebase login
```

### Error: "Project not found"
```bash
firebase use --add
# Selecciona teereserve-golf de la lista
```

### Error: "Maps not loading"
1. Verifica que el secreto esté configurado
2. Verifica las restricciones de dominio
3. Verifica que la facturación esté activa
4. Haz un redeploy

---

## 🎯 Resultado Final

Cuando hayas completado todos los pasos:
- Tu aplicación estará completamente funcional en producción
- Google Maps funcionará correctamente
- Los pagos con Stripe funcionarán
- Todas las funcionalidades estarán operativas

**URL Final:** https://teereserve-golf.web.app
https://teereserve.golf