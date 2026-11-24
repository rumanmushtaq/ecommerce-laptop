'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

/** Whether the live 3D companion is on screen; slots hide their still images once it is. */
const CompanionContext = createContext<{ active: boolean; setActive: (on: boolean) => void }>({
  active: false,
  setActive: () => {},
})

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  return <CompanionContext.Provider value={{ active, setActive }}>{children}</CompanionContext.Provider>
}

export const useCompanion = () => useContext(CompanionContext)
