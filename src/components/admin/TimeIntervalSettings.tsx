'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeIntervalSettingsProps {
  courseId?: string;
  initialInterval?: number;
  initialOperatingHours?: {
    openingTime: string;
    closingTime: string;
  };
  onSave?: (settings: {
    teeTimeInterval: number;
    operatingHours: {
      openingTime: string;
      closingTime: string;
    };
  }) => void;
}

const INTERVAL_OPTIONS = [
  { value: 10, label: '10 minutos' },
  { value: 12, label: '12 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' }
];

export default function TimeIntervalSettings({
  courseId,
  initialInterval = 12,
  initialOperatingHours = { openingTime: '07:30', closingTime: '18:30' },
  onSave
}: TimeIntervalSettingsProps) {
  const [interval, setInterval] = useState(initialInterval);
  const [openingTime, setOpeningTime] = useState(initialOperatingHours.openingTime);
  const [closingTime, setClosingTime] = useState(initialOperatingHours.closingTime);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!openingTime || !closingTime) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos",
        variant: "destructive"
      });
      return;
    }

    // Validate that opening time is before closing time
    const opening = new Date(`2000-01-01T${openingTime}:00`);
    const closing = new Date(`2000-01-01T${closingTime}:00`);
    
    if (opening >= closing) {
      toast({
        title: "Error",
        description: "La hora de apertura debe ser anterior a la hora de cierre",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const settings = {
        teeTimeInterval: interval,
        operatingHours: {
          openingTime,
          closingTime
        }
      };

      if (onSave) {
        await onSave(settings);
        toast({
          title: "Éxito",
          description: "Configuración de intervalos guardada exitosamente"
        });
      }
    } catch (error) {
      console.error('Error saving interval settings:', error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Configuración de Intervalos de Tiempo
        </CardTitle>
        <CardDescription>
          Configure los intervalos de tiempo y horarios de operación para este campo de golf.
          Los horarios pasados del día actual se bloquearán automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Intervalo de Tiempo</Label>
            <Select value={interval.toString()} onValueChange={(value) => setInterval(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar intervalo" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-time">Hora de Apertura</Label>
            <Input
              id="opening-time"
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing-time">Hora de Cierre</Label>
            <Input
              id="closing-time"
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Vista Previa de Configuración</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Intervalo:</strong> Cada {interval} minutos</p>
            <p><strong>Horario:</strong> {openingTime} - {closingTime}</p>
            <p><strong>Bloqueo automático:</strong> Los horarios pasados del día actual se bloquearán automáticamente</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}