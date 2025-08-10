'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n, type Locale } from '@/i18n-config'
import { Button } from '../ui/button'
import { Languages } from 'lucide-react'

interface LanguageSwitcherProps {
    lang: Locale;
}

export function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathName = usePathname()

  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }
  
  const otherLang = lang === 'en' ? 'es' : 'en'

  return (
    <Button variant="ghost" asChild>
        <Link href={redirectedPathName(otherLang)}>
            <Languages className="mr-2 h-4 w-4" />
            {otherLang.toUpperCase()}
        </Link>
    </Button>
  )
}
