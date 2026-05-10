import { useDeviceType } from './use-device-type'

// Re-export useIsMobile from the new system for backward compatibility
export function useIsMobile() {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}
