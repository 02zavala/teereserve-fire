
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Star } from 'lucide-react'
import type { getDictionary } from '@/lib/get-dictionary'
import type { Locale } from '@/i18n-config'

const heroImages = [
  { src: 'https://placehold.co/1200x800.png', hint: 'golf course sunrise' },
  { src: 'https://placehold.co/1200x800.png', hint: 'golf course ocean' },
  { src: 'https://placehold.co/1200x800.png', hint: 'golf fairway' },
  { src: 'https://placehold.co/1200x800.png', hint: 'golfer swinging' }
]

interface HeroSectionProps {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['heroSection'];
    lang: Locale;
}

export function HeroSection({ dictionary, lang }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <Image
            key={index}
            src={image.src}
            alt="Hero background image"
            data-ai-hint={image.hint}
            fill
            className={`object-cover object-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            priority={index === 0}
          />
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6">
          {dictionary.title} <span className="text-primary">{dictionary.titleHighlight}</span>
        </h1>

        <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
          {dictionary.subtitle}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{dictionary.stats.courses.value}</div>
            <div className="text-sm text-primary-foreground/80">{dictionary.stats.courses.label}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{dictionary.stats.golfers.value}</div>
            <div className="text-sm text-primary-foreground/80">{dictionary.stats.golfers.label}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{dictionary.stats.rating.value}</div>
            <div className="text-sm text-primary-foreground/80 flex items-center justify-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {dictionary.stats.rating.label}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{dictionary.stats.support.value}</div>
            <div className="text-sm text-primary-foreground/80">{dictionary.stats.support.label}</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="text-lg px-8 py-4 h-auto"
            asChild
          >
            <Link href={`/${lang}/courses`}>
              <Calendar className="mr-2 h-5 w-5" />
              {dictionary.bookButton}
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
            asChild
          >
            <Link href={`/${lang}/courses`}>
              <MapPin className="mr-2 h-5 w-5" />
              {dictionary.exploreButton}
            </Link>
          </Button>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 right-8 z-10 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to image ${index + 1}`}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-primary' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
