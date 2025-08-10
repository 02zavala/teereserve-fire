
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') {
      return;
    }
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}


export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookie('cookie_consent');
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('cookie_consent', 'true', 365);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-card/80 backdrop-blur-sm border-border/60">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            Usamos cookies para mejorar tu experiencia en nuestro sitio. Al continuar, aceptas nuestro uso de cookies. {' '}
            <Link href="/privacy" className="underline text-primary">
              Política de Privacidad
            </Link>
          </p>
          <Button onClick={handleAccept}>Aceptar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
