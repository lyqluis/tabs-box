import { generateId } from "."

export const formatedWindow = (window) => {
  return {...window, id: generateId()}
}
