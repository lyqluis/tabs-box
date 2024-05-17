import { createContext, useContext } from "react"

const ctx = createContext(null)
console.log("ctx", ctx)

export const { Provider } = ctx

export const useGlobalCtx = () => useContext(ctx)
