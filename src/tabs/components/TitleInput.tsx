import { useEffect, useRef, useState } from "react"
import Check from "react:~assets/svg/check.svg"
import Cross from "react:~assets/svg/cross.svg"

const TitleInput = ({ title, setTitle, disable }) => {
  console.log("🔩 TitleInput refresh", title)
  const inputRef = useRef(null)
  const [isEdit, setIsEdit] = useState(false)
  const [inputValue, setInputValue] = useState(title)
  const defaultValueRef = useRef(title)
  
  const openEdit = () => setIsEdit(true)
  const closeEdit = () => {
    console.log("closeedit", title)
    setInputValue(defaultValueRef.current)
    setIsEdit(false)
  }
  const onChange = (e) => setInputValue(e.target.value)
  const onSubmit = () => {
    console.log("on submit")
    setTitle(inputValue)
    defaultValueRef.current = inputValue
    inputRef.current.blur()
  }
  const onKeyDown = (e) => {
    if (e && e.key === "Enter") {
      onSubmit()
      inputRef.current.blur()
    }
  }
  // ensure button's click is fired before blur
  const onMouseDown = (e) => e.preventDefault()

  useEffect(() => {
    setInputValue(title)
    defaultValueRef.current = title
  }, [title])

  if (disable)
    return <h3 className="flex h-7 items-center text-2xl">{title}</h3>

  if (isEdit) {
    return (
      <div className="input-wrapper flex h-7 items-center">
        <input
          type="text"
          autoFocus
          ref={inputRef}
          className="input h-7 w-auto rounded-none border-0 border-none p-0 text-2xl leading-none text-slate-600 outline-none focus:rounded-none focus:border-b focus:border-solid focus:border-slate-600 focus:outline-none"
          placeholder={inputValue}
          value={inputValue}
          onChange={onChange}
          onBlur={closeEdit}
          onKeyDown={onKeyDown}
        />
        <button
          className="btn btn-square btn-outline btn-primary btn-xs m-0.5 flex-none"
          onClick={onSubmit}
          onMouseDown={onMouseDown}>
          <Check></Check>
        </button>
        <button
          className="btn btn-square btn-outline btn-primary btn-xs m-0.5 flex-none"
          onClick={closeEdit}>
          <Cross></Cross>
        </button>
      </div>
    )
  }

  return (
    <h3 className="flex h-7 items-center text-2xl" onClick={openEdit}>
      {title}
    </h3>
  )
}

export default TitleInput
