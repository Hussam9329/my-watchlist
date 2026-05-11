import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

function getDeviceType(): DeviceType {
  const width = window.innerWidth
  if (width < MOBILE_BREAKPOINT) return 'mobile'
  if (width < TABLET_BREAKPOINT) return 'tablet'
  return 'desktop'
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>('desktop')

  React.useEffect(() => {
    // ✅ حساب فوري عند أول تحميل
    setDeviceType(getDeviceType())

    let timer: ReturnType<typeof setTimeout>

    const onChange = () => {
      // ✅ debounce: لا يحسب إلا بعد 150ms من توقف الـ resize
      clearTimeout(timer)
      timer = setTimeout(() => {
        setDeviceType(getDeviceType())
      }, 150)
    }

    window.addEventListener('resize', onChange, { passive: true })
    return () => {
      window.removeEventListener('resize', onChange)
      clearTimeout(timer)
    }
  }, [])

  return deviceType
}

export function useIsMobile() {
  return useDeviceType() === 'mobile'
}
