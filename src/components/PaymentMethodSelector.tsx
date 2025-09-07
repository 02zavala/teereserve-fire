"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Zap } from 'lucide-react';
import Image from 'next/image';

export type PaymentMethod = 'stripe' | 'paypal';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange, 
  disabled = false 
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Método de Pago</h3>
        <Badge variant="secondary" className="text-xs">
          Pago Seguro
        </Badge>
      </div>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        disabled={disabled}
        className="space-y-3"
      >
        {/* Stripe Payment Method */}
        <div className="relative">
          <RadioGroupItem 
            value="stripe" 
            id="stripe" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="stripe" 
            className="cursor-pointer"
          >
            <Card className="peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Tarjeta de Crédito/Débito</CardTitle>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      3D Secure
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Instantáneo
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Procesado por Stripe • Autenticación 3D Secure • Guarda tu tarjeta de forma segura</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Image src="/images/visa.svg" alt="Visa" width={32} height={20} className="opacity-70" />
                  <Image src="/images/mastercard.svg" alt="Mastercard" width={32} height={20} className="opacity-70" />
                  <Image src="/images/amex.svg" alt="American Express" width={32} height={20} className="opacity-70" />
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>

        {/* PayPal Payment Method */}
        <div className="relative">
          <RadioGroupItem 
            value="paypal" 
            id="paypal" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="paypal" 
            className="cursor-pointer"
          >
            <Card className="peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106h4.61a.641.641 0 0 0 .633-.74l.654-4.15c.082-.518.526-.9 1.05-.9h1.25c3.78 0 6.73-1.54 7.59-5.99.72-3.73-.39-6.28-2.132-7.742z"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-base">PayPal</CardTitle>
                      <p className="text-sm text-muted-foreground">Paga con tu cuenta PayPal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Protección
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Rápido
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Protección del comprador PayPal • Sin compartir datos bancarios • Pago seguro</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    PayPal
                  </div>
                  <span className="text-xs text-muted-foreground">Cuenta PayPal o tarjeta</span>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>
      
      {/* Security Notice */}
      <div className="bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Seguridad Garantizada</p>
            <p>Todos los pagos están protegidos con encriptación SSL de 256 bits y cumplen con los estándares PCI DSS. Tu información financiera está completamente segura.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodSelector;