import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const getIsMobileSnapshot = () => {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

const subscribeToMobileChanges = (callback: () => void) => {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY)
  mql.addEventListener("change", callback)

  return () => {
    mql.removeEventListener("change", callback)
  }
}

export const useIsMobile = () =>
  useSyncExternalStore(subscribeToMobileChanges, getIsMobileSnapshot, () => false)
