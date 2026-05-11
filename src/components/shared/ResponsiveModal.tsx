// ==================== Shared Responsive Modal ====================

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { X } from 'lucide-react'
import type { DeviceType } from '@/hooks/use-device-type'

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footerContent?: React.ReactNode
  wide?: boolean
  isMobile: boolean
  deviceType?: DeviceType
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  footerContent,
  wide = false,
  isMobile,
  deviceType,
}: ResponsiveModalProps) {
  const effective: DeviceType = deviceType || (isMobile ? 'mobile' : 'desktop')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [drawerHeight, setDrawerHeight] = useState<number | null>(null)

  // ✅ الحل الجذري: نتابع visualViewport ونحسب الارتفاع الحقيقي المتاح
  useEffect(() => {
    if (effective !== 'mobile' || !open) {
      setDrawerHeight(null)
      return
    }

    const updateHeight = () => {
      const vv = window.visualViewport
      if (!vv) return

      // الارتفاع الحقيقي المتاح = ارتفاع الـ viewport بعد ظهور الكيبورد
      const availableHeight = vv.height
      setDrawerHeight(availableHeight)

      // اسكرول للعنصر المفعّل بعد تحديث الارتفاع
      setTimeout(() => {
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }, 150)
    }

    updateHeight()
    window.visualViewport?.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('scroll', updateHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('scroll', updateHeight)
      setDrawerHeight(null)
    }
  }, [effective, open])

  // ── Mobile: Drawer ──────────────────────────────────────────────
  if (effective === 'mobile') {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="bg-[#0f0f0f] border-[#2a2a2a] flex flex-col"
          style={{
            // ✅ ارتفاع ثابت مبني على visualViewport وليس dvh
            height: drawerHeight ? `${drawerHeight * 0.92}px` : '92dvh',
            maxHeight: drawerHeight ? `${drawerHeight * 0.92}px` : '92dvh',
            // ✅ نمنع الـ transform الذي يسبب الطيران لفوق
            transform: 'none !important',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <DrawerHeader className="border-b border-[#2a2a2a] px-4 py-3 shrink-0 flex-row items-center justify-between">
            <DrawerTitle className="text-[#d4af37] font-bold text-base">{title}</DrawerTitle>
            <DrawerClose className="w-9 h-9 rounded-full bg-[#2a2a2a]/50 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors">
              <X className="w-4 h-4" />
            </DrawerClose>
          </DrawerHeader>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 min-h-0"
            data-vaul-no-drag
          >
            {children}
          </div>

          {footerContent && (
            <DrawerFooter className="border-t border-[#2a2a2a] shrink-0 bg-[#0f0f0f] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] z-10">
              {footerContent}
            </DrawerFooter>
          )}
          {!footerContent && (
            <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)]" />
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  // ── Tablet ───────────────────────────────────────────────────────
  if (effective === 'tablet') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] flex flex-col overflow-hidden ${wide ? 'max-w-xl' : 'max-w-md'}`}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-[#d4af37] font-bold text-lg">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 text-base">
            {children}
          </div>
          {footerContent && (
            <div className="shrink-0 border-t border-[#2a2a2a] pt-3 mt-2">
              {footerContent}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  // ── Desktop ──────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] flex flex-col overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-[#d4af37] font-bold text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {children}
        </div>
        {footerContent && (
          <div className="shrink-0 border-t border-[#2a2a2a] pt-3 mt-2">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
