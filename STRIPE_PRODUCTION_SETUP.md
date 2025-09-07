# Configuración de Stripe para Producción

## Warnings de Desarrollo

Durante el desarrollo local, es normal ver estos warnings de Stripe en la consola del navegador:

### 1. Warning de HTTPS
```
[Stripe.js] If you are testing Apple Pay or Google Pay, you must serve this page over HTTPS as it will not work over HTTP.
```

**Solución**: Este warning es normal en desarrollo local (HTTP). Apple Pay y Google Pay requieren HTTPS para funcionar.

**Para desarrollo**:
- Puedes ignorar este warning si no estás probando Apple Pay/Google Pay
- Para probar estos métodos, usa `ngrok` o similar para crear un túnel HTTPS

**Para producción**:
- Asegúrate de que tu sitio esté servido sobre HTTPS
- Vercel, Netlify y otros proveedores proporcionan HTTPS automáticamente

### 2. Warning de Verificación de Dominio
```
[Stripe.js] You have not registered or verified the domain, so the following payment methods are not enabled in the Payment Element:
- apple_pay
```

**Solución**: Necesitas registrar y verificar tu dominio en Stripe Dashboard.

## Pasos para Configuración de Producción

### 1. Verificar Dominio en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navega a **Settings** > **Payment methods**
3. En la sección **Apple Pay**, haz clic en **Add domain**
4. Ingresa tu dominio de producción (ej: `teereserve.golf`)
5. Sigue las instrucciones para verificar el dominio

### 2. Configurar Variables de Entorno de Producción

Asegúrate de usar las claves de producción de Stripe:

```env
# Producción - Reemplaza con tus claves reales
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### 3. Habilitar Métodos de Pago

En Stripe Dashboard:
1. Ve a **Settings** > **Payment methods**
2. Habilita los métodos de pago que desees:
   - **Apple Pay**: Requiere verificación de dominio
   - **Google Pay**: Se habilita automáticamente con dominio verificado
   - **Tarjetas**: Ya habilitado por defecto

### 4. Configurar Webhooks (Opcional)

Para eventos de pago en tiempo real:
1. Ve a **Developers** > **Webhooks**
2. Agrega endpoint: `https://tudominio.com/api/webhooks/stripe`
3. Selecciona eventos relevantes:
   - `payment_intent.succeeded`
   - `payment_method.attached`
   - `customer.created`

## Verificación de Configuración

### Lista de Verificación Pre-Producción

- [ ] Dominio verificado en Stripe Dashboard
- [ ] Variables de entorno de producción configuradas
- [ ] HTTPS habilitado en el servidor
- [ ] Apple Pay/Google Pay probados en dispositivos reales
- [ ] Webhooks configurados (si es necesario)
- [ ] Pruebas de pago completadas en modo live

### Comandos de Verificación

```bash
# Verificar que las variables estén configuradas
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo $STRIPE_SECRET_KEY

# Verificar que empiecen con pk_live_ y sk_live_
```

## Notas Importantes

- **Nunca** uses claves de producción en desarrollo
- **Siempre** verifica los pagos en modo test antes de ir a producción
- Los warnings de desarrollo son normales y desaparecerán en producción con HTTPS
- Apple Pay requiere dispositivos Apple reales para pruebas (no simuladores)

## Recursos Adicionales

- [Stripe Payment Methods Documentation](https://stripe.com/docs/payments/payment-methods)
- [Apple Pay Domain Verification](https://stripe.com/docs/apple-pay/web#domain-verification)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)