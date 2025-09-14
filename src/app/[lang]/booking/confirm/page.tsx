"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Calendar, Clock, Users, MapPin, CreditCard } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Locale } from '@/i18n-config';

interface Booking {
  id: string;
  courseId: string;
  courseName?: string;
  date: string;
  teeTime: string;
  players: number;
  amount: number;
  currency: string;
  status: string;
  isGuest: boolean;
  guest?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentIntentId: string;
  createdAt: any;
}

function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const bookingId = searchParams?.get('id');
  const lang = 'es' as Locale; // You might want to get this from the URL

  useEffect(() => {
    if (!bookingId) {
      router.push(`/${lang}/courses`);
      return;
    }

    const fetchBooking = async () => {
      try {
        if (!db) {
          throw new Error('Firebase not initialized');
        }
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
        
        if (!bookingDoc.exists()) {
          setError('Reserva no encontrada');
          return;
        }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
        
        // Fetch course name if needed
        if (bookingData.courseId && !bookingData.courseName) {
          try {
            const courseDoc = await getDoc(doc(db, 'courses', bookingData.courseId));
            if (courseDoc.exists()) {
              bookingData.courseName = courseDoc.data().name;
            }
          } catch (err) {
            console.warn('Could not fetch course name:', err);
          }
        }
        
        setBooking(bookingData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router, lang]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive mb-4">
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-muted-foreground mt-2">{error || 'Reserva no encontrada'}</p>
              </div>
              <Button onClick={() => router.push(`/${lang}/courses`)}>
                Volver a Cursos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount / 100);
  };

  // Calcular desglose de precios
  const calculatePriceBreakdown = (totalAmount: number) => {
    // El total ya incluye impuestos, calculamos hacia atrás
    const subtotal = totalAmount / 1.16; // Dividir por 1.16 para obtener el subtotal
    const tax = totalAmount - subtotal; // La diferencia son los impuestos
    const discount = 0; // Por ahora no hay descuentos implementados
    
    return {
      subtotal: Math.round(subtotal), // Redondear a centavos
      tax: Math.round(tax),
      discount: Math.round(discount),
      total: totalAmount
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground mt-2">
            Tu reserva ha sido procesada exitosamente
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles de la Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.courseName || 'Campo de Golf'}</p>
                  <p className="text-sm text-muted-foreground">Campo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(booking.date)}</p>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.teeTime}</p>
                  <p className="text-sm text-muted-foreground">Hora de salida</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.players} jugador{booking.players > 1 ? 'es' : ''}</p>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information */}
        {booking.isGuest && booking.guest && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información del Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{booking.guest.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Price Breakdown */}
            <div className="space-y-3 mb-4">
              {(() => {
                const priceBreakdown = calculatePriceBreakdown(booking.amount);
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formatAmount(priceBreakdown.subtotal, booking.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Impuestos (16%):</span>
                      <span className="font-medium">{formatAmount(priceBreakdown.tax, booking.currency)}</span>
                    </div>
                    {priceBreakdown.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Descuento:</span>
                        <span className="font-medium text-green-600">-{formatAmount(priceBreakdown.discount, booking.currency)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Pagado:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatAmount(priceBreakdown.total, booking.currency)}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium text-green-600 capitalize">{booking.status}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                ID de Transacción: {booking.paymentIntentId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/${lang}/courses`)}
            className="flex-1"
          >
            Explorar Más Cursos
          </Button>
          <Button 
            onClick={() => window.print()}
            className="flex-1"
          >
            Imprimir Confirmación
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Información Importante</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Llega al menos 30 minutos antes de tu hora de salida</li>
            <li>• Trae una identificación válida</li>
            <li>• Revisa las reglas del campo antes de jugar</li>
            <li>• Para cancelaciones, contacta al campo directamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}