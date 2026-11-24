'use client'

import { MotionConfig } from 'motion/react'
import { Cursor, ScrollProgress } from './layout/Chrome'
import { Navbar } from './layout/Navbar'
import { BagDrawer, MobileMenu, SearchOverlay, Toasts } from './layout/Overlays'
import { Footer } from './layout/Footer'
import { QuickView } from './layout/QuickView'
import { MobileShopBar, SectionRail } from './layout/Wayfinding'
import { Collections } from './sections/Collections'
import { FeaturedProducts } from './sections/FeaturedProducts'
import { FinalCta } from './sections/FinalCta'
import { Gaming } from './sections/Gaming'
import { Hero } from './sections/Hero'
import { KineticTapes } from './sections/KineticTapes'
import { Offers } from './sections/Offers'
import { Showcase } from './sections/Showcase'
import { Testimonials } from './sections/Testimonials'
import { TrustStrip } from './sections/TrustStrip'
import { WhyUs } from './sections/WhyUs'
import { AuroraBackdrop } from './ui/motion'
import { useSmoothScroll } from '../lib/smoothScroll'
import { StoreProvider, useStore } from '../lib/store'
import { Companion } from './companion/Companion'
import { CompanionProvider } from './companion/context'

function SmoothScroll() {
  const { panel } = useStore()
  useSmoothScroll(panel !== null)
  return null
}

export default function NoctisApp() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <CompanionProvider>
        <SmoothScroll />
        <AuroraBackdrop />
        <ScrollProgress />
        <Cursor />
        <Navbar />
        <main className="grain">
          <Hero />
          <TrustStrip />
          <Collections />
          <FeaturedProducts />
          <KineticTapes />
          <Showcase />
          <Gaming />
          <Offers />
          <WhyUs />
          <Testimonials />
          <FinalCta />
        </main>
        <Footer />
        <Companion />
        <SectionRail />
        <MobileShopBar />
        <BagDrawer />
        <SearchOverlay />
        <QuickView />
        <MobileMenu />
        <Toasts />
        </CompanionProvider>
      </StoreProvider>
    </MotionConfig>
  )
}
