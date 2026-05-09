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
        <DrawerContent className="bg-[#0f0f0f] border-[#2a2a2a] max-h-[92vh]">
          <DrawerHeader className="border-b border-[#2a2a2a] px-4 py-3">
            <DrawerTitle className="text-[#d4af37] font-bold text-base">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-3" data-vaul-no-drag>
            {children}
          </div>
          {footerContent && (
            <DrawerFooter className="border-t border-[#2a2a2a]">
              {footerContent}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#d4af37] font-bold text-base">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
