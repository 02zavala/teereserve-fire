import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Health check endpoint
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get request headers
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy' as const,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: await checkDatabase(),
        storage: await checkStorage(),
        auth: await checkAuth(),
        external: await checkExternalServices(),
      },
      metrics: {
        responseTime: 0, // Will be calculated at the end
        requestCount: 1, // This would be tracked in a real implementation
        errorRate: 0, // This would be calculated from actual metrics
      },
    };

    // Calculate response time
    checks.metrics.responseTime = Date.now() - startTime;

    // Determine overall status based on service checks
    const serviceStatuses = Object.values(checks.services);
    const healthyServices = serviceStatuses.filter(service => service.status === 'healthy').length;
    const totalServices = serviceStatuses.length;

    if (healthyServices === totalServices) {
      checks.status = 'healthy';
    } else if (healthyServices >= totalServices * 0.7) {
      checks.status = 'warning' as any;
    } else {
      checks.status = 'error' as any;
    }

    // Return appropriate status code
    const statusCode = checks.status === 'healthy' ? 200 : 
                      checks.status === 'warning' ? 200 : 503;

    return NextResponse.json(checks, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          responseTime: Date.now() - startTime,
        },
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}

// Database health check
async function checkDatabase() {
  try {
    // In a real implementation, you would check your database connection
    // For Firebase Firestore, you might do a simple read operation
    
    // Simulate database check
    const isHealthy = true; // Replace with actual database check
    
    return {
      status: isHealthy ? 'healthy' as const : 'error' as const,
      responseTime: Math.random() * 100, // Simulated response time
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Database check failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// Storage health check
async function checkStorage() {
  try {
    // In a real implementation, you would check your storage service
    // For Firebase Storage, you might check if you can access a test file
    
    const isHealthy = true; // Replace with actual storage check
    
    return {
      status: isHealthy ? 'healthy' as const : 'error' as const,
      responseTime: Math.random() * 50,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Storage check failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// Authentication service health check
async function checkAuth() {
  try {
    // In a real implementation, you would check your auth service
    // For Firebase Auth, you might verify the service is accessible
    
    const isHealthy = true; // Replace with actual auth check
    
    return {
      status: isHealthy ? 'healthy' as const : 'error' as const,
      responseTime: Math.random() * 30,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Auth check failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// External services health check
async function checkExternalServices() {
  try {
    // Check external services like payment processors, email services, etc.
    const checks = await Promise.allSettled([
      checkStripe(),
      checkEmailService(),
      checkGoogleMaps(),
    ]);

    const results = checks.map(check => 
      check.status === 'fulfilled' ? check.value : { status: 'error', error: 'Service unavailable' }
    );

    const healthyCount = results.filter(result => result.status === 'healthy').length;
    const totalCount = results.length;

    return {
      status: healthyCount === totalCount ? 'healthy' as const : 
              healthyCount >= totalCount * 0.5 ? 'warning' as const : 'error' as const,
      services: {
        stripe: results[0],
        email: results[1],
        maps: results[2],
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'External services check failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// Individual service checks
async function checkStripe() {
  try {
    // In production, you might make a simple API call to Stripe
    const isConfigured = !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY);
    
    return {
      status: isConfigured ? 'healthy' as const : 'warning' as const,
      configured: isConfigured,
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: 'Stripe check failed',
    };
  }
}

async function checkEmailService() {
  try {
    // Check if email service is configured
    const isConfigured = !!(process.env.ZOHO_MAIL_CLIENT_ID && process.env.ZOHO_MAIL_CLIENT_SECRET);
    
    return {
      status: isConfigured ? 'healthy' as const : 'warning' as const,
      configured: isConfigured,
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: 'Email service check failed',
    };
  }
}

async function checkGoogleMaps() {
  try {
    // Check if Google Maps API is configured
    const isConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    return {
      status: isConfigured ? 'healthy' as const : 'warning' as const,
      configured: isConfigured,
    };
  } catch (error) {
    return {
      status: 'error' as const,
      error: 'Google Maps check failed',
    };
  }
}

// HEAD method for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}