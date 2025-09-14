# Configuraciones Pendientes - TeeReserve Golf

## 🗺️ Google Maps API - URGENTE

### Problema Actual
- Error: `RefererNotAllowedMapError`
- El dominio `teereserve-golf.web.app` no está autorizado en Google Cloud Console

### Solución Requerida
1. **Ir a Google Cloud Console**: https://console.cloud.google.com/
2. **Navegar a**: APIs & Services > Credentials
3. **Seleccionar**: La API Key de Maps JavaScript API
4. **En "Application restrictions"**:
   - Seleccionar "HTTP referrers (web sites)"
   - Agregar estos dominios:
     ```
     teereserve-golf.web.app/*
     *.teereserve-golf.web.app/*
     localhost:3000/*
     127.0.0.1:3000/*
     ```
5. **Guardar cambios**

### Verificación
- Probar el mapa en: https://teereserve-golf.web.app/es/courses/[cualquier-curso]
- El mapa debe cargar sin errores en la consola

---

## 🔧 Configuraciones Completadas ✅

### ✅ Firebase Scorecards
- **Problema**: Campo 'notes' undefined causaba errores
- **Solución**: Implementado spread operator condicional en `ScorecardManager.tsx`
- **Estado**: Corregido

### ✅ Stripe Payment Intent
- **Problema**: Error "Failed to create payment intent"
- **Solución**: Verificada configuración de claves y estructura de respuesta API
- **Estado**: Funcionando correctamente

### ✅ AI Recommendations Server Components
- **Problema**: Función 'use server' llamada desde componentes cliente
- **Solución**: Creada ruta API `/api/recommendations` y actualizado componente
- **Estado**: Corregido

### ✅ Búsqueda de Campos de Golf
- **Problema**: Botón de búsqueda no funcionaba
- **Solución**: Implementado manejo de parámetros de búsqueda en página de cursos
- **Estado**: Funcionando

---

## 🚀 Próximos Pasos

### 1. Configurar Google Maps (PRIORITARIO)
- Seguir las instrucciones de Google Maps API arriba
- Tiempo estimado: 5-10 minutos

### 2. Deploy Final
- Una vez configurado Google Maps, hacer deploy:
  ```bash
  npm run build
  firebase deploy
  ```

### 3. Verificación Post-Deploy
- [ ] Probar búsqueda de campos
- [ ] Verificar mapas en páginas de cursos
- [ ] Probar proceso de reserva completo
- [ ] Verificar recomendaciones AI
- [ ] Probar creación de scorecards

---

## 📞 Contacto de Soporte

Si necesitas ayuda con alguna configuración:
- **Google Cloud Console**: Documentación oficial de Google Maps API
- **Firebase**: Console de Firebase para configuraciones de hosting
- **Stripe**: Dashboard de Stripe para configuraciones de pagos

---

## 🔍 Comandos Útiles

```bash
# Verificar variables de entorno
npm run check-env

# Probar configuración de Stripe
node scripts/test-stripe-payments.js

# Build y deploy
npm run build
firebase deploy

# Verificar logs
firebase functions:log
```

---

**Última actualización**: $(date)
**Estado general**: 🟡 Pendiente configuración de Google Maps
**Prioridad**: Alta - Afecta funcionalidad de mapas en producción