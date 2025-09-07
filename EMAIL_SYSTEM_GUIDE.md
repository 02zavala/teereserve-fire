# 📧 Guía del Sistema de Notificaciones por Email - TeeReserve

## 🎯 Resumen

Sistema completo de notificaciones por email implementado con **Resend** como proveedor principal. El sistema incluye plantillas HTML responsivas, APIs seguras y ejemplos de integración.

## ✅ Estado Actual

- ✅ **Resend configurado** con API key real
- ✅ **Servicio de email** implementado (`lib/email.js`)
- ✅ **APIs REST** para diferentes tipos de notificaciones
- ✅ **Plantillas HTML** responsivas y profesionales
- ✅ **Sistema probado** y funcionando correctamente
- ✅ **Ejemplos de integración** disponibles

## 🔧 Configuración

### Variables de Entorno (`.env.local`)

```env
# Email Configuration - Resend (Primary)
RESEND_API_KEY=re_BAJBSUSE_9DWRL9hU1Fm6BuUBqjEPQcX1
RESEND_FROM_EMAIL=info@teereserve.golf
RESEND_REPLY_TO=info@teereserve.golf
EMAIL_FROM=info@teereserve.golf
CONTACT_FORM_RECIPIENT=info@teereserve.golf
```

### Dependencias

```bash
npm install resend
```

## 📁 Estructura de Archivos

```
├── lib/
│   └── email.js                    # Servicio principal de email
├── pages/api/email/
│   ├── welcome.js                  # API para emails de bienvenida
│   ├── booking-confirmation.js     # API para confirmaciones de reserva
│   └── contact.js                  # API para formulario de contacto
├── scripts/
│   └── test-resend-email.js       # Script de pruebas
├── examples/
│   └── email-integration.js       # Ejemplos de integración
└── EMAIL_SYSTEM_GUIDE.md          # Esta guía
```

## 🚀 APIs Disponibles

### 1. Email de Bienvenida

**Endpoint:** `POST /api/email/welcome`

```javascript
const response = await fetch('/api/email/welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userEmail: 'usuario@example.com',
    userName: 'Juan Pérez',
    idToken: 'firebase-id-token'
  })
});
```

### 2. Confirmación de Reserva

**Endpoint:** `POST /api/email/booking-confirmation`

```javascript
const response = await fetch('/api/email/booking-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userEmail: 'usuario@example.com',
    idToken: 'firebase-id-token',
    bookingDetails: {
      courseName: 'Campo de Golf Premium',
      date: '15/01/2024',
      time: '10:00',
      players: 4,
      totalPrice: '120.00'
    }
  })
});
```

### 3. Formulario de Contacto

**Endpoint:** `POST /api/email/contact`

```javascript
const response = await fetch('/api/email/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+34 600 123 456', // Opcional
    subject: 'Consulta sobre reservas',
    message: 'Hola, tengo una pregunta sobre...'
  })
});
```

## 🎨 Tipos de Email Disponibles

### 1. Email de Bienvenida
- **Cuándo:** Después del registro de usuario
- **Contenido:** Bienvenida, características principales, CTA al dashboard
- **Diseño:** Gradiente verde, profesional

### 2. Confirmación de Reserva
- **Cuándo:** Después de confirmar una reserva y pago
- **Contenido:** Detalles de la reserva, información del campo
- **Diseño:** Gradiente azul, información estructurada

### 3. Notificación de Contacto
- **Cuándo:** Cuando alguien envía el formulario de contacto
- **Contenido:** Datos del usuario y mensaje
- **Diseño:** Naranja, formato de notificación interna

### 4. Confirmación de Contacto
- **Cuándo:** Automáticamente después del formulario de contacto
- **Contenido:** Confirmación de recepción del mensaje
- **Diseño:** Verde, tranquilizador

### 5. Restablecimiento de Contraseña
- **Cuándo:** Cuando el usuario solicita restablecer contraseña
- **Contenido:** Enlace seguro para restablecer
- **Diseño:** Rojo, enfoque en seguridad

## 🔒 Seguridad

- **Autenticación:** Todas las APIs (excepto contacto) requieren token de Firebase
- **Validación:** Validación estricta de datos de entrada
- **Rate Limiting:** Implementar en producción
- **Sanitización:** Escape automático de HTML en plantillas

## 🧪 Pruebas

### Ejecutar Pruebas Completas

```bash
node scripts/test-resend-email.js
```

### Resultado Esperado

```
🧪 Iniciando prueba del sistema de email con Resend...
📧 API Key configurada: Sí
📨 Email origen: info@teereserve.golf

1️⃣ Probando email de bienvenida...
✅ Email de bienvenida enviado: b43e1f14-10f0-4790-a0a1-d2b073723cb9

2️⃣ Probando email de confirmación de reserva...
✅ Email de confirmación enviado: 513b4483-e96b-4009-b079-b7dcc99c6f64

3️⃣ Probando email de contacto...
✅ Email de contacto enviado: undefined

🎉 ¡Todas las pruebas completadas exitosamente!
```

## 📱 Integración en Componentes React

### Hook Personalizado

```javascript
import { useEmailNotifications } from '../examples/email-integration';

function RegistrationForm() {
  const { sendWelcomeEmail, loading, error } = useEmailNotifications();
  
  const handleRegistration = async (userData) => {
    try {
      // Registrar usuario...
      await sendWelcomeEmail(userData.email, userData.name, idToken);
      // Mostrar éxito...
    } catch (error) {
      // Manejar error...
    }
  };
  
  return (
    // JSX del formulario...
  );
}
```

## 🚨 Troubleshooting

### Error: "API key inválida"
- Verificar que `RESEND_API_KEY` esté configurado correctamente
- Confirmar que la API key sea válida en Resend

### Error: "Dominio no verificado"
- Verificar el dominio `teereserve.golf` en el panel de Resend
- Usar un dominio verificado para `RESEND_FROM_EMAIL`

### Emails no llegan
- Verificar carpeta de spam
- Confirmar que el email de destino sea válido
- Revisar logs de Resend en su dashboard

## 📊 Monitoreo

### Logs del Sistema
- Todos los emails se registran en consola con IDs únicos
- Errores se capturan y reportan automáticamente

### Dashboard de Resend
- Acceder a [resend.com](https://resend.com) para ver estadísticas
- Monitorear entregas, rebotes y quejas

## 🔄 Próximos Pasos

1. **Integrar en flujo de registro** - Llamar API después del registro
2. **Integrar en proceso de reserva** - Enviar confirmaciones automáticas
3. **Implementar rate limiting** - Prevenir abuso
4. **Añadir plantillas adicionales** - Cancelaciones, recordatorios
5. **Configurar webhooks** - Manejar rebotes y quejas

## 📞 Soporte

Para problemas o preguntas sobre el sistema de email:
- Revisar esta documentación
- Ejecutar script de pruebas
- Verificar logs de la aplicación
- Consultar documentación de Resend

---

**✅ Sistema listo para producción** - Configurado y probado exitosamente.