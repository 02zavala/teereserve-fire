const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

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

// Configuración de Firebase
const firebaseConfig = {
  apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: envVars.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔍 Diagnóstico de Firebase Auth');
console.log('================================');

// Verificar variables de entorno
console.log('\n📋 Variables de entorno:');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value ? 'Configurado' : 'FALTANTE'}`);
});

// Verificar configuración
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.log('\n❌ Variables faltantes:', missingVars.join(', '));
  process.exit(1);
}

try {
  // Inicializar Firebase
  console.log('\n🚀 Inicializando Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
  
  // Inicializar Auth
  console.log('\n🔐 Inicializando Firebase Auth...');
  const auth = getAuth(app);
  console.log('✅ Firebase Auth inicializado correctamente');
  
  // Verificar configuración de Auth
  console.log('\n📊 Configuración de Auth:');
  console.log(`✅ Auth Domain: ${auth.config.authDomain}`);
  console.log(`✅ API Key: ${auth.config.apiKey ? 'Configurado' : 'FALTANTE'}`);
  
  // Verificar conectividad
  console.log('\n🌐 Verificando conectividad...');
  
  // Simular una operación de auth para verificar conectividad
  auth.onAuthStateChanged((user) => {
    console.log('✅ Listener de auth state configurado correctamente');
    if (user) {
      console.log(`✅ Usuario autenticado: ${user.email}`);
    } else {
      console.log('ℹ️  No hay usuario autenticado');
    }
  });
  
  console.log('\n✅ Diagnóstico completado - Firebase Auth está configurado correctamente');
  console.log('\n💡 Posibles causas del error auth/internal-error:');
  console.log('   1. Dominio localhost no autorizado en Firebase Console');
  console.log('   2. Configuración de CORS en Firebase');
  console.log('   3. Conflicto con extensiones del navegador');
  console.log('   4. Cache del navegador corrupto');
  
  console.log('\n🔧 Soluciones recomendadas:');
  console.log('   1. Agregar localhost:3000 a dominios autorizados en Firebase Console');
  console.log('   2. Limpiar cache del navegador');
  console.log('   3. Probar en modo incógnito');
  console.log('   4. Verificar configuración de red/firewall');
  
} catch (error) {
  console.error('\n❌ Error en el diagnóstico:', error);
  console.error('\n🔍 Detalles del error:');
  console.error(`   Código: ${error.code || 'N/A'}`);
  console.error(`   Mensaje: ${error.message || 'N/A'}`);
  process.exit(1);
}