'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, DollarSign, Settings, Plus, Edit, Trash2, Calculator, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { PricingEngine } from '@/lib/pricing-engine';
import { Season, TimeBand, PriceRule, PriceRuleType, PriceCalculationInput, PriceCalculationResult, SpecialOverride } from '@/types';
import { format, parseISO } from 'date-fns';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ValidationError } from '@/lib/error-handling';

interface PricingManagerProps {
  courseId: string;
  courseName: string;
}

export function PricingManager({ courseId, courseName }: PricingManagerProps) {
  const pricingEngine = new PricingEngine();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [timeBands, setTimeBands] = useState<TimeBand[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [specialOverrides, setSpecialOverrides] = useState<SpecialOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Estados para diálogos
  const [seasonDialog, setSeasonDialog] = useState(false);
  const [timeBandDialog, setTimeBandDialog] = useState(false);
  const [priceRuleDialog, setPriceRuleDialog] = useState(false);
  const [calculatorDialog, setCalculatorDialog] = useState(false);
  
  // Estados para formularios
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingTimeBand, setEditingTimeBand] = useState<TimeBand | null>(null);
  const [editingPriceRule, setEditingPriceRule] = useState<PriceRule | null>(null);
  
  // Estado para calculadora de precios
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculationResult | null>(null);
  const [calculationInput, setCalculationInput] = useState<PriceCalculationInput>({
    courseId,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    players: 2
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = () => {
    setIsLoading(true);
    try {
      setSeasons(pricingEngine.getSeasons(courseId));
      setTimeBands(pricingEngine.getTimeBands(courseId));
      setPriceRules(pricingEngine.getPriceRules(courseId));
      setSpecialOverrides(pricingEngine.getSpecialOverrides(courseId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los datos de precios',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { handleAsyncError } = useErrorHandler();

  const handleSeasonSubmit = (formData: FormData) => {
    handleAsyncError(async () => {
      const name = formData.get('name') as string;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;
      const priority = formData.get('priority') as string;

      // Validación de datos
      if (!name || name.trim().length < 3) {
        throw new ValidationError('El nombre de la temporada debe tener al menos 3 caracteres');
      }

      if (!startDate || isNaN(new Date(startDate).getTime())) {
        throw new ValidationError('La fecha de inicio no es válida');
      }

      if (!endDate || isNaN(new Date(endDate).getTime())) {
        throw new ValidationError('La fecha de fin no es válida');
      }

      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      
      if (endDateTime <= startDateTime) {
        throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const priorityNum = parseInt(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 100) {
        throw new ValidationError('La prioridad debe ser un número entre 1 y 100');
      }

      const seasonData = {
        courseId,
        name,
        startDate,
        endDate,
        priority: priorityNum,
        active: formData.get('active') === 'on'
      };

      console.log('Guardando temporada:', seasonData);

      if (editingSeason) {
        pricingEngine.updateSeason(editingSeason.id, seasonData);
        toast({ title: 'Éxito', description: 'Temporada actualizada correctamente' });
      } else {
        pricingEngine.addSeason(seasonData);
        toast({ title: 'Éxito', description: 'Temporada creada correctamente' });
      }
      
      loadData();
      setSeasonDialog(false);
      setEditingSeason(null);
    }, { defaultMessage: 'Error al guardar la temporada' });
  };

  const handleTimeBandSubmit = (formData: FormData) => {
    handleAsyncError(async () => {
      const label = formData.get('label') as string;
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;

      // Validación de datos
      if (!label || label.trim().length < 3) {
        throw new ValidationError('La etiqueta de la banda horaria debe tener al menos 3 caracteres');
      }

      if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
        throw new ValidationError('La hora de inicio no es válida (formato HH:MM)');
      }

      if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
        throw new ValidationError('La hora de fin no es válida (formato HH:MM)');
      }

      // Validar que la hora de fin sea posterior a la de inicio
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        throw new ValidationError('La hora de fin debe ser posterior a la hora de inicio');
      }

      const timeBandData = {
        courseId,
        label,
        startTime,
        endTime,
        active: formData.get('active') === 'on'
      };

      console.log('Guardando banda horaria:', timeBandData);

      if (editingTimeBand) {
        // En el motor actual no hay updateTimeBand, se puede agregar
        toast({ title: 'Info', description: 'Función de actualización pendiente de implementar' });
      } else {
        // En el motor actual no hay addTimeBand, se puede agregar
        toast({ title: 'Info', description: 'Función de creación pendiente de implementar' });
      }
      
      loadData();
      setTimeBandDialog(false);
      setEditingTimeBand(null);
    }, { defaultMessage: 'Error al guardar la banda horaria' });
  };

  const handlePriceRuleSubmit = (formData: FormData) => {
    handleAsyncError(async () => {
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const priceType = formData.get('priceType') as PriceRuleType;
      const priceValue = formData.get('priceValue') as string;
      const priority = formData.get('priority') as string;
      const leadTimeMin = formData.get('leadTimeMin') as string;
      const leadTimeMax = formData.get('leadTimeMax') as string;
      const playersMin = formData.get('playersMin') as string;
      const playersMax = formData.get('playersMax') as string;
      const minPrice = formData.get('minPrice') as string;
      const maxPrice = formData.get('maxPrice') as string;

      // Validación de datos obligatorios
      if (!name || name.trim().length < 3) {
        throw new ValidationError('El nombre de la regla debe tener al menos 3 caracteres');
      }

      if (!priceType || !['fixed', 'delta', 'multiplier'].includes(priceType)) {
        throw new ValidationError('Debe seleccionar un tipo de precio válido');
      }

      const priceValueNum = parseFloat(priceValue);
      if (isNaN(priceValueNum) || priceValueNum <= 0) {
        throw new ValidationError('El valor del precio debe ser un número positivo');
      }

      // Validación específica por tipo de precio
      if (priceType === 'delta' && Math.abs(priceValueNum) > 10000) {
        throw new ValidationError('El valor delta no puede ser mayor a 10000');
      }

      if (priceType === 'multiplier' && (priceValueNum < 0.1 || priceValueNum > 10)) {
        throw new ValidationError('El multiplicador debe estar entre 0.1 y 10');
      }

      const priorityNum = parseInt(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 100) {
        throw new ValidationError('La prioridad debe ser un número entre 1 y 100');
      }

      // Validación de rangos opcionales
      let leadTimeMinNum, leadTimeMaxNum, playersMinNum, playersMaxNum;
      let minPriceNum, maxPriceNum;

      if (leadTimeMin) {
        leadTimeMinNum = parseInt(leadTimeMin);
        if (isNaN(leadTimeMinNum) || leadTimeMinNum < 0) {
          throw new ValidationError('El tiempo mínimo de anticipación debe ser un número positivo');
        }
      }

      if (leadTimeMax) {
        leadTimeMaxNum = parseInt(leadTimeMax);
        if (isNaN(leadTimeMaxNum) || leadTimeMaxNum < 0) {
          throw new ValidationError('El tiempo máximo de anticipación debe ser un número positivo');
        }
        if (leadTimeMinNum && leadTimeMaxNum <= leadTimeMinNum) {
          throw new ValidationError('El tiempo máximo debe ser mayor al tiempo mínimo');
        }
      }

      if (playersMin) {
        playersMinNum = parseInt(playersMin);
        if (isNaN(playersMinNum) || playersMinNum < 1 || playersMinNum > 8) {
          throw new ValidationError('El número mínimo de jugadores debe estar entre 1 y 8');
        }
      }

      if (playersMax) {
        playersMaxNum = parseInt(playersMax);
        if (isNaN(playersMaxNum) || playersMaxNum < 1 || playersMaxNum > 8) {
          throw new ValidationError('El número máximo de jugadores debe estar entre 1 y 8');
        }
        if (playersMinNum && playersMaxNum < playersMinNum) {
          throw new ValidationError('El número máximo de jugadores debe ser mayor o igual al mínimo');
        }
      }

      if (minPrice) {
        minPriceNum = parseFloat(minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          throw new ValidationError('El precio mínimo debe ser un número positivo');
        }
      }

      if (maxPrice) {
        maxPriceNum = parseFloat(maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          throw new ValidationError('El precio máximo debe ser un número positivo');
        }
        if (minPriceNum && maxPriceNum <= minPriceNum) {
          throw new ValidationError('El precio máximo debe ser mayor al precio mínimo');
        }
      }

      const priceRuleData = {
        courseId,
        name,
        description,
        seasonId: formData.get('seasonId') as string || undefined,
        timeBandId: formData.get('timeBandId') as string || undefined,
        dow: formData.get('dow') ? (formData.get('dow') as string).split(',').map(Number) : undefined,
        leadTimeMin: leadTimeMinNum,
        leadTimeMax: leadTimeMaxNum,
        occupancyMin: formData.get('occupancyMin') ? parseInt(formData.get('occupancyMin') as string) : undefined,
        occupancyMax: formData.get('occupancyMax') ? parseInt(formData.get('occupancyMax') as string) : undefined,
        playersMin: playersMinNum,
        playersMax: playersMaxNum,
        priceType,
        priceValue: priceValueNum,
        priority: priorityNum,
        active: formData.get('active') === 'on',
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        roundTo: formData.get('roundTo') ? parseInt(formData.get('roundTo') as string) : undefined
      };

      console.log('Guardando regla de precio:', priceRuleData);

      if (editingPriceRule) {
        pricingEngine.updatePriceRule(editingPriceRule.id, priceRuleData);
        toast({ title: 'Éxito', description: 'Regla de precio actualizada correctamente' });
      } else {
        pricingEngine.addPriceRule(priceRuleData);
        toast({ title: 'Éxito', description: 'Regla de precio creada correctamente' });
      }
      
      loadData();
      setPriceRuleDialog(false);
      setEditingPriceRule(null);
    }, { defaultMessage: 'Error al guardar la regla de precio' });
  };

  const handleCalculatePrice = async () => {
    handleAsyncError(async () => {
      // Validación de entrada para el cálculo de precios
      if (!calculationInput.courseId) {
        throw new ValidationError('Debe seleccionar un campo de golf');
      }

      if (!calculationInput.date || !calculationInput.time) {
        throw new ValidationError('Debe especificar una fecha y hora');
      }

      if (!calculationInput.players || calculationInput.players < 1 || calculationInput.players > 8) {
        throw new ValidationError('El número de jugadores debe estar entre 1 y 8');
      }

      const teeDate = new Date(`${calculationInput.date}T${calculationInput.time}:00`);
      const now = new Date();
      
      if (teeDate <= now) {
        throw new ValidationError('La fecha y hora del tee time debe ser futura');
      }

      console.log('Calculando precio con datos:', calculationInput);
      
      const result = await pricingEngine.calculatePrice(calculationInput);
      setPriceCalculation(result);
      
      toast({
        title: 'Éxito',
        description: 'Precio calculado correctamente'
      });
    }, { defaultMessage: 'Error al calcular el precio' });
  };

  const deleteSeason = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta temporada?')) {
      handleAsyncError(async () => {
        if (!id || typeof id !== 'string') {
          throw new ValidationError('ID de temporada inválido');
        }

        console.log('Eliminando temporada:', id);
        
        pricingEngine.deleteSeason(id);
        loadData();
        
        toast({ title: 'Éxito', description: 'Temporada eliminada correctamente' });
      }, { defaultMessage: 'Error al eliminar la temporada' });
    }
  };

  const deletePriceRule = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta regla de precio?')) {
      pricingEngine.deletePriceRule(id);
      loadData();
      toast({ title: 'Éxito', description: 'Regla de precio eliminada correctamente' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Precios</h1>
          <p className="text-muted-foreground">{courseName}</p>
        </div>
        <Button onClick={() => setCalculatorDialog(true)} variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Calculadora de Precios
        </Button>
      </div>

      <Tabs defaultValue="seasons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seasons">Temporadas</TabsTrigger>
          <TabsTrigger value="timebands">Bandas Horarias</TabsTrigger>
          <TabsTrigger value="rules">Reglas de Precios</TabsTrigger>
          <TabsTrigger value="overrides">Excepciones Especiales</TabsTrigger>
        </TabsList>

        <TabsContent value="seasons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Temporadas
                  </CardTitle>
                  <CardDescription>
                    Gestiona las temporadas alta, media y baja del campo
                  </CardDescription>
                </div>
                <Dialog open={seasonDialog} onOpenChange={setSeasonDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingSeason(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Temporada
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSeason ? 'Editar Temporada' : 'Nueva Temporada'}
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handleSeasonSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingSeason?.name}
                          placeholder="Ej: Alta Temporada Oct-Nov"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Fecha Inicio</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            defaultValue={editingSeason?.startDate}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Fecha Fin</Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            defaultValue={editingSeason?.endDate}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridad</Label>
                        <Input
                          id="priority"
                          name="priority"
                          type="number"
                          defaultValue={editingSeason?.priority || 50}
                          placeholder="Mayor número = mayor prioridad"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          name="active"
                          defaultChecked={editingSeason?.active ?? true}
                        />
                        <Label htmlFor="active">Activa</Label>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingSeason ? 'Actualizar' : 'Crear'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasons.map((season) => (
                    <TableRow key={season.id}>
                      <TableCell className="font-medium">{season.name}</TableCell>
                      <TableCell>
                        {format(parseISO(season.startDate), 'dd/MM/yyyy')} - {format(parseISO(season.endDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{season.priority}</TableCell>
                      <TableCell>
                        <Badge variant={season.active ? 'default' : 'secondary'}>
                          {season.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSeason(season);
                              setSeasonDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSeason(season.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timebands" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Bandas Horarias
                  </CardTitle>
                  <CardDescription>
                    Define los períodos Early, Prime y Twilight
                  </CardDescription>
                </div>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Banda (Próximamente)
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etiqueta</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeBands.map((band) => (
                    <TableRow key={band.id}>
                      <TableCell className="font-medium">{band.label}</TableCell>
                      <TableCell>{band.startTime} - {band.endTime}</TableCell>
                      <TableCell>
                        <Badge variant={band.active ? 'default' : 'secondary'}>
                          {band.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Reglas de Precios
                  </CardTitle>
                  <CardDescription>
                    Configura las reglas de cálculo de precios dinámicos
                  </CardDescription>
                </div>
                <Dialog open={priceRuleDialog} onOpenChange={setPriceRuleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPriceRule(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Regla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPriceRule ? 'Editar Regla' : 'Nueva Regla de Precio'}
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handlePriceRuleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingPriceRule?.name}
                            placeholder="Ej: Premium Fin de Semana"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Prioridad</Label>
                          <Input
                            id="priority"
                            name="priority"
                            type="number"
                            defaultValue={editingPriceRule?.priority || 50}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingPriceRule?.description}
                          placeholder="Descripción opcional de la regla"
                        />
                      </div>

                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="seasonId">Temporada</Label>
                          <Select name="seasonId" defaultValue={editingPriceRule?.seasonId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar temporada" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Cualquier temporada</SelectItem>
                              {seasons.map((season) => (
                                <SelectItem key={season.id} value={season.id}>
                                  {season.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="timeBandId">Banda Horaria</Label>
                          <Select name="timeBandId" defaultValue={editingPriceRule?.timeBandId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar banda" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Cualquier horario</SelectItem>
                              {timeBands.map((band) => (
                                <SelectItem key={band.id} value={band.id}>
                                  {band.label} ({band.startTime}-{band.endTime})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="priceType">Tipo de Precio</Label>
                          <Select name="priceType" defaultValue={editingPriceRule?.priceType} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Precio Fijo</SelectItem>
                              <SelectItem value="delta">Delta (+/-)</SelectItem>
                              <SelectItem value="multiplier">Multiplicador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="priceValue">Valor</Label>
                          <Input
                            id="priceValue"
                            name="priceValue"
                            type="number"
                            step="0.01"
                            defaultValue={editingPriceRule?.priceValue}
                            placeholder="Ej: 2200, 150, 1.10"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="roundTo">Redondear a</Label>
                          <Input
                            id="roundTo"
                            name="roundTo"
                            type="number"
                            defaultValue={editingPriceRule?.roundTo}
                            placeholder="Ej: 5, 10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          name="active"
                          defaultChecked={editingPriceRule?.active ?? true}
                        />
                        <Label htmlFor="active">Regla Activa</Label>
                      </div>

                      <DialogFooter>
                        <Button type="submit">
                          {editingPriceRule ? 'Actualizar' : 'Crear'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.priceType}</Badge>
                      </TableCell>
                      <TableCell>{rule.priceValue}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        <Badge variant={rule.active ? 'default' : 'secondary'}>
                          {rule.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPriceRule(rule);
                              setPriceRuleDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePriceRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Excepciones Especiales
                  </CardTitle>
                  <CardDescription>
                    Gestiona precios especiales para fechas específicas
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Excepción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialOverrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell className="font-medium">{override.name}</TableCell>
                      <TableCell>{format(parseISO(override.startDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {override.startTime && override.endTime 
                          ? `${override.startTime} - ${override.endTime}`
                          : 'Todo el día'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={override.overrideType === 'block' ? 'destructive' : 'default'}>
                          {override.overrideType === 'block' ? 'Bloqueado' : 'Precio Especial'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={override.active ? 'default' : 'secondary'}>
                          {override.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calculadora de Precios */}
      <Dialog open={calculatorDialog} onOpenChange={setCalculatorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora de Precios
            </DialogTitle>
            <DialogDescription>
              Simula el cálculo de precios para diferentes escenarios
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calc-date">Fecha</Label>
                <Input
                  id="calc-date"
                  type="date"
                  value={calculationInput.date}
                  onChange={(e) => setCalculationInput(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="calc-time">Hora</Label>
                <Input
                  id="calc-time"
                  type="time"
                  value={calculationInput.time}
                  onChange={(e) => setCalculationInput(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="calc-players">Jugadores</Label>
              <Input
                id="calc-players"
                type="number"
                min="1"
                max="4"
                value={calculationInput.players}
                onChange={(e) => setCalculationInput(prev => ({ ...prev, players: parseInt(e.target.value) }))}
              />
            </div>
            
            <Button onClick={handleCalculatePrice} className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Calcular Precio
            </Button>
            
            {priceCalculation && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado del Cálculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Precio Base</Label>
                      <p className="text-2xl font-bold">${priceCalculation.basePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Precio Final por Jugador</Label>
                      <p className="text-2xl font-bold text-primary">${priceCalculation.finalPricePerPlayer.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Total ({priceCalculation.players} jugadores)</Label>
                    <p className="text-3xl font-bold text-green-600">${priceCalculation.totalPrice.toFixed(2)}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Reglas Aplicadas</Label>
                    <div className="space-y-2 mt-2">
                      {priceCalculation.appliedRules.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{rule.ruleName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{rule.ruleType}</Badge>
                            <span className="text-sm font-medium">${rule.resultPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}