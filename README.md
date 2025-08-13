
# TeeReserve Golf - Plataforma Premium de Reservas de Golf (Visión Empresarial)

TeeReserve Golf está evolucionando de una aplicación de reservas premium a una plataforma SaaS multi-inquilino escalable, segura y robusta para la gestión de campos de golf a nivel empresarial en Los Cabos, México, y más allá. Este documento describe la visión arquitectónica y el plan estratégico para esta transformación.

## Pilares Fundamentales de la Solución Empresarial

1.  **Arquitectura Multi-Inquilino (Multi-Tenant):** Soportar múltiples campos de golf, cada uno con su propio subdominio, marca y configuraciones personalizadas.
2.  **Seguridad de Nivel Empresarial:** Alcanzar el cumplimiento de PCI DSS Nivel 1 con detección avanzada de fraudes y protocolos de seguridad robustos.
3.  **Experiencia de Usuario Superior:** Ofrecer una Progressive Web App (PWA) de alto rendimiento con capacidades sin conexión y funciones en tiempo real.
4.  **Operaciones Basadas en Datos:** Proporcionar un panel de análisis completo para inteligencia de negocio en tiempo real.
5.  **Extensibilidad e Integración:** Ofrecer APIs públicas para una integración perfecta con sistemas externos.
6.  **IA y Automatización:** Aprovechar la inteligencia artificial para precios dinámicos, previsión de la demanda y marketing personalizado.

---

## 1. Arquitectura del Sistema (Multi-Inquilino)

La plataforma se basa en una arquitectura multi-inquilino donde cada campo de golf (un "inquilino") opera dentro de una infraestructura compartida pero con aislamiento de datos y marca.

**Estructura de Datos (Firestore):**

La base de datos de Firestore está estructurada en torno a un `tenantId` (que es el `courseId`) para garantizar una segregación estricta de los datos.

```
/courses/{courseId}  // Representa un Inquilino
  - name: "Palmilla Golf Club"
  - subdomain: "palmilla"
  - branding: { primaryColor: "#...", logoUrl: "..." }
  - settings: { operatingHours: [...], bookingPolicy: "...", currency: "usd" }
  - (otros datos específicos del campo...)

  // Subcolecciones para datos específicos del inquilino
  /courses/{courseId}/teeTimes/{date_time}
  /courses/{courseId}/bookings/{bookingId}
  /courses/{courseId}/reviews/{reviewId}

/users/{userId}
  - email: "user@example.com"
  - displayName: "John Doe"
  - roles: {
      "{courseId}": "Admin",        // El usuario es un Admin para un campo específico
      "{anotherCourseId}": "Staff"
    }
```

**Manejo de Subdominios (Middleware de Next.js):**

El middleware de Next.js (`src/middleware.ts`) es responsable de identificar al inquilino basándose en el hostname de la solicitud (p. ej., `palmilla.teereserve.golf`). Extrae el subdominio, lo mapea a un `courseId` y reescribe la solicitud internamente. Esto permite que la aplicación cargue dinámicamente la marca, configuración y datos correctos para el inquilino activo.

---

## 2. Estrategia de Seguridad

La seguridad es primordial. La plataforma está diseñada para cumplir con los estándares PCI DSS Nivel 1 y proteger contra amenazas modernas.

-   **Cumplimiento PCI DSS:**
    -   **Procesamiento de Pagos:** Todo el procesamiento de pagos se delega a **Stripe**, que cuenta con la certificación PCI DSS Nivel 1. Los datos sensibles de los titulares de tarjetas se envían directamente a los servidores de Stripe mediante tokenización (usando Stripe Elements) y nunca tocan nuestros servidores de aplicación.
    -   **3D Secure:** Stripe Payments está configurado para activar automáticamente 3D Secure en transacciones que cumplen ciertos criterios de riesgo, añadiendo una capa crucial de autenticación.
    -   **TLS 1.3:** Se fuerza todo el tráfico a usar TLS 1.3 a través de las configuraciones de Firebase Hosting y Cloudflare.

-   **Detección de Fraude con IA:**
    -   Se creará un **Flujo de Genkit** para analizar los intentos de reserva antes del pago. Este flujo puntuará el riesgo de la transacción basándose en factores como: importe, discrepancia de ubicación (IP vs. facturación), historial del usuario y hora del día.
    -   Según la puntuación de riesgo, el sistema automáticamente:
        1.  **Aprobará:** Las transacciones de bajo riesgo proceden directamente.
        2.  **Desafiará:** Las transacciones de riesgo medio se fuerzan a completar 3D Secure.
        3.  **Revisión Manual:** Las transacciones de alto riesgo se marcan para revisión administrativa.
        4.  **Bloqueará:** Los intentos de riesgo extremadamente alto se bloquean.

-   **Seguridad de la Infraestructura:**
    -   **Reglas de Seguridad de Firebase:** El acceso a Firestore se controla rigurosamente con reglas que aplican el aislamiento de datos del inquilino (p. ej., un usuario solo puede acceder a datos relacionados con su `courseId`).
    -   **Firebase App Check:** Asegura que las solicitudes a nuestro backend se originen desde nuestra aplicación legítima, previniendo abusos.
    -   **Cloudflare WAF y Protección DDoS:** La integración de Firebase Hosting con Cloudflare proporciona un Web Application Firewall de nivel empresarial y una protección robusta contra ataques DDoS.

---

## 3. Stack Tecnológico

La solución aprovecha un stack tecnológico moderno, sin servidor y altamente escalable.

-   **Frontend:** **Next.js 15 (App Router)** con React, Tailwind CSS y ShadCN UI.
-   **Backend e IA:** **Google Genkit** para orquestar flujos de IA y lógica del lado del servidor, ejecutándose en infraestructura sin servidor.
-   **Base de Datos:** **Firebase Firestore** para almacenamiento de datos NoSQL escalable y en tiempo real.
-   **Autenticación:** **Firebase Authentication** con soporte para correo/contraseña, OAuth y control de acceso basado en roles (RBAC).
-   **Almacenamiento de Archivos:** **Firebase Storage** para imágenes de campos y contenido subido por usuarios.
-   **Pagos:** **Stripe** para procesamiento de pagos seguro y compatible con PCI.
-   **Hosting y CDN:** **Firebase Hosting** para entrega de contenido global de baja latencia, configurado automáticamente con un CDN y SSL.

---

## 4. Progressive Web App (PWA) y Soporte Sin Conexión

La aplicación es una PWA con todas las funciones para proporcionar una experiencia similar a la de una aplicación nativa.

-   **Service Workers:** Un service worker (`next-pwa`) almacena en caché los activos críticos de la aplicación (la estructura base, datos estáticos) para permitir la navegación sin conexión de la información de los cursos y datos vistos previamente.
-   **Sincronización de Datos Sin Conexión:** Los datos clave del usuario, como sus propias reservas, se almacenan localmente usando IndexedDB. Cuando el usuario está sin conexión, todavía puede ver sus próximas reservas. Cualquier acción realizada sin conexión (como redactar una reseña) se pone en cola y se sincroniza automáticamente cuando se restablece la conectividad.
-   **Notificaciones Push:** Se utiliza Firebase Cloud Messaging (FCM) para enviar notificaciones push para confirmaciones de reservas, recordatorios y ofertas especiales.

---

## 5. Panel de Análisis

El panel de administración cuenta con un panel de análisis en tiempo real con visualizaciones avanzadas.

-   **Métricas en Tiempo Real:**
    -   **Ingresos:** Agregados en tiempo real utilizando Extensiones de Firebase que sincronizan los datos a un almacén de análisis dedicado (como BigQuery).
    -   **Tasa de Ocupación:** Calculada mediante funciones programadas que analizan el estado de los `teeTimes`.
    -   **Net Promoter Score (NPS):** Recopilado a través de encuestas posteriores a la reserva.
-   **Visualizaciones:**
    -   **Gráficos y Diagramas:** Usando `shadcn/charts` y Recharts para mostrar tendencias en ingresos, reservas y crecimiento de usuarios.
    -   **Mapas de Calor:** Una representación visual de la popularidad de los tee times por día y hora.

---

## 6. APIs Públicas e Integraciones

-   **API RESTful:**
    -   Se utilizan Firebase Functions para exponer endpoints RESTful para consumo público (p. ej., `GET /api/courses/{courseId}/availability`).
    -   **Autenticación:** El acceso se gestiona mediante claves de API seguras y específicas del inquilino.
    -   **Documentación:** Se genera y aloja automáticamente una especificación OpenAPI (Swagger) para los desarrolladores.
-   **Webhooks:** El sistema puede enviar notificaciones webhook a servicios externos en eventos como `booking.confirmed`.
-   **Integraciones Externas:**
    -   **Google Calendar:** Los usuarios pueden añadir su reserva a su Google Calendar con un solo clic.
    -   **WhatsApp Business:** Se envían confirmaciones y recordatorios de reserva automatizados a través de la API de WhatsApp.
    -   **Stripe Radar:** Integrado para reglas avanzadas y preconstruidas de detección de fraudes.

---

## 7. Instalación y Despliegue

### Paso 1: Configuración Local

1.  **Clonar el Repositorio:** Abre tu terminal y clona el proyecto desde GitHub:
    ```bash
    git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    cd TU_REPOSITORIO
    ```
2.  **Prerrequisitos:** Asegúrate de tener instalados [Node.js](https://nodejs.org/) (versión 18 o superior) y la [Firebase CLI](https://firebase.google.com/docs/cli).
3.  **Instalar Dependencias:**
    ```bash
    npm install
    ```
4.  **Variables de Entorno:** Crea un archivo `.env.local` copiando el archivo `.env.local.example`. Complétalo con la configuración de tu proyecto de Firebase y tus claves de API (Stripe, Google Maps, etc.).
5.  **Ejecutar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

### Paso 2: Desplegar en Firebase Hosting

El despliegue está completamente automatizado a través de Firebase Hosting.

1.  **Conectar con Firebase:** Si aún no lo has hecho, inicia sesión en Firebase desde tu terminal:
    ```bash
    firebase login
    ```
    Luego, conecta tu proyecto local con tu proyecto de Firebase:
    ```bash
    firebase use <tu-id-de-proyecto>
    ```
2.  **Construir Proyecto:** Crea una compilación lista para producción de tu aplicación Next.js:
    ```bash
    npm run build
    ```
3.  **Desplegar:** Despliega tu aplicación en Firebase Hosting con un solo comando:
    ```bash
    firebase deploy --only hosting
    ```

Firebase se encargará automáticamente de aprovisionar la infraestructura sin servidor, la configuración del CDN y el certificado SSL. ¡Después de unos momentos, te dará la URL en vivo de tu aplicación!

---

## 8. Estrategia de Soporte y Monitoreo

-   **Monitoreo 24/7:**
    -   **Google Cloud Operations (antes Stackdriver):** Proporciona registro, monitoreo y alertas completos para todos los servicios de Firebase.
    -   **Alertas:** Se configuran alertas automáticas para eventos críticos, como picos de errores, alta latencia o denegaciones de reglas de seguridad.
-   **Soporte al Usuario:**
    -   Funcionalidad de mesa de ayuda integrada.
    -   Soporte por chat en tiempo real a través de la API de WhatsApp Business.
-   **Disponibilidad y Estado:** Una página de estado pública informará sobre la salud de todos los componentes del sistema.
