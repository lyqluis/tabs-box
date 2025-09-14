import useOperations from "@/hooks/useOperations"
import useSelect from "@/hooks/useSelect"
import { type ReactNode } from "react"
import { createContext, useContextSelector } from "@/hooks/useContextSelector"

// define the context type by combining the return types of both hooks
interface OperationsContextType
	extends ReturnType<typeof useOperations>,
		ReturnType<typeof useSelect> {}

const ctx = createContext(null)
const { Provider } = ctx

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
	const selectOperations = useSelect()
	const operations = useOperations(selectOperations)

	return (
		<Provider
			value={{ ...operations, ...selectOperations } as OperationsContextType}
		>
			{children}
		</Provider>
	)
}

// export const useOperationsContext = () => useContext(ctx)
export const useOperationsContextSelector = (
	selector: (value: OperationsContextType) => unknown
) => useContextSelector(ctx, selector)
