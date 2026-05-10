// ==================== Shared Responsive Modal ====================

'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footerContent?: React.ReactNode
  wide?: boolean
  isMobile: boolean
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  footerContent,
  wide = false,
  isMobile,
}: ResponsiveModalProps) {
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-[#0f0f0f] border-[#2a2a2a] max-h-[92dvh] flex flex-col">
          <DrawerHeader className="border-b border-[#2a2a2a] px-4 py-3 shrink-0">
            <DrawerTitle className="text-[#d4af37] font-bold text-base">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3" data-vaul-no-drag>
            {children}
          </div>
          {footerContent && (
            <DrawerFooter className="border-t border-[#2a2a2a] shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              {footerContent}
            </DrawerFooter>
          )}
          {/* Safe area spacer when no footer */}
          {!footerContent && (
            <div className="shrink-0 h-[env(safe-area-inset-bottom,0px)]" />
          )}
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] flex flex-col overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-[#d4af37] font-bold text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain">
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
