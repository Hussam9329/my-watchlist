import * as React from "react"

// Breakpoints:
// < 768px  → mobile  (Drawer)
// 768-1024 → tablet  (Wide Dialog or Medium Drawer with touch-friendly sizing)
// > 1024px → desktop (Dialog)
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType | undefined>(undefined)

  React.useEffect(() => {
    const onChange = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return deviceType || 'desktop'
}

// Backward-compatible hook - keeps existing isMobile logic working
export function useIsMobile() {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}
