import { createContext, useContext } from "react"

const ctx = createContext(null)

export const { Provider } = ctx

export const useGlobalCtx = () => useContext(ctx)
