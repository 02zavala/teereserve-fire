const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico del Error SavePaymentMethod');
console.log('===========================================\n');

// Cargar variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').replace(/^"|"$/g, ''); // Remove quotes
    envVars[key.trim()] = value.trim();
  }
});

console.log('📋 Verificando configuración de Stripe:');
const stripeSecretKey = envVars.STRIPE_SECRET_KEY;
const stripePublishableKey = envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  console.log('❌ STRIPE_SECRET_KEY: FALTANTE');
} else if (stripeSecretKey.includes('placeholder') || stripeSecretKey.includes('your_')) {
  console.log('❌ STRIPE_SECRET_KEY: Contiene placeholder');
} else {
  console.log('✅ STRIPE_SECRET_KEY: Configurado');
}

if (!stripePublishableKey) {
  console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: FALTANTE');
} else if (stripePublishableKey.includes('placeholder') || stripePublishableKey.includes('your_')) {
  console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Contiene placeholder');
} else {
  console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Configurado');
}

console.log('\n🔧 Verificando archivos críticos:');

// Verificar archivos importantes
const criticalFiles = [
  'src/hooks/usePaymentMethods.ts',
  'src/app/api/payment-methods/route.ts',
  'src/components/CheckoutForm.tsx'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}: Existe`);
  } else {
    console.log(`❌ ${file}: NO ENCONTRADO`);
  }
});

console.log('\n🚨 Posibles causas del error console.error({}):\n');

console.log('1. **Error de autenticación Firebase:**');
console.log('   - Token JWT expirado o inválido');
console.log('   - Usuario no autenticado correctamente\n');

console.log('2. **Error de configuración Stripe:**');
console.log('   - Claves de Stripe incorrectas o de test/producción mezcladas');
console.log('   - Webhook endpoints mal configurados\n');

console.log('3. **Error de red/conectividad:**');
console.log('   - Problemas de conexión con Stripe API');
console.log('   - Firewall bloqueando requests\n');

console.log('4. **Error de datos:**');
console.log('   - PaymentMethodId inválido o undefined');
console.log('   - Datos de tarjeta incorrectos\n');

console.log('5. **Error de manejo de excepciones:**');
console.log('   - Catch block recibiendo undefined/null');
console.log('   - Error en serialización JSON\n');

console.log('🔧 Pasos de solución recomendados:\n');

console.log('1. **Verificar logs del navegador:**');
console.log('   - Abrir DevTools → Console');
console.log('   - Buscar errores detallados con el nuevo logging\n');

console.log('2. **Verificar logs del servidor:**');
console.log('   - Revisar terminal donde corre `npm run dev`');
console.log('   - Buscar "SavePaymentMethod API Error Details"\n');

console.log('3. **Probar con tarjeta de test:**');
console.log('   - Usar: 4242 4242 4242 4242');
console.log('   - Fecha: cualquier fecha futura');
console.log('   - CVC: cualquier 3 dígitos\n');

console.log('4. **Verificar autenticación:**');
console.log('   - Confirmar que el usuario está logueado');
console.log('   - Verificar token Firebase válido\n');

console.log('5. **Revisar configuración Stripe:**');
console.log('   - Confirmar que las claves son del mismo entorno');
console.log('   - Verificar que el webhook está configurado\n');

console.log('📊 Estado del diagnóstico: COMPLETADO');
console.log('\n💡 Con el logging mejorado, ahora deberías ver errores más detallados en:');
console.log('   - Console del navegador: "SavePaymentMethod Error Details"');
console.log('   - Logs del servidor: "SavePaymentMethod API Error Details"');
console.log('\n🎯 Próximo paso: Reproducir el error y revisar los nuevos logs detallados.');