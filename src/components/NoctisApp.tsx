'use client'

import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { Cursor, Preloader, ScrollProgress } from './layout/Chrome'
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
import { Offers } from './sections/Offers'
import { Showcase } from './sections/Showcase'
import { Testimonials } from './sections/Testimonials'
import { TrustStrip } from './sections/TrustStrip'
import { WhyUs } from './sections/WhyUs'
import { AuroraBackdrop } from './ui/motion'
import { useSmoothScroll } from '../lib/smoothScroll'
import { StoreProvider, useStore } from '../lib/store'

function SmoothScroll() {
  const { panel } = useStore()
  useSmoothScroll(panel !== null)
  return null
}

export default function NoctisApp() {
  const [ready, setReady] = useState(false)
  const onLoaded = useCallback(() => setReady(true), [])

  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <SmoothScroll />
        <AuroraBackdrop />
        <Preloader onDone={onLoaded} />
        <ScrollProgress />
        <Cursor />
        <Navbar ready={ready} />
        <main className="grain">
          <Hero ready={ready} />
          <TrustStrip />
          <Collections />
          <FeaturedProducts />
          <Showcase />
          <Gaming />
          <Offers />
          <WhyUs />
          <Testimonials />
          <FinalCta />
        </main>
        <Footer />
        <SectionRail />
        <MobileShopBar />
        <BagDrawer />
        <SearchOverlay />
        <QuickView />
        <MobileMenu />
        <Toasts />
      </StoreProvider>
    </MotionConfig>
  )
}
