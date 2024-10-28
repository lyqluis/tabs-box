import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react"
import Check from "react:~assets/svg/check.svg"
import Cross from "react:~assets/svg/cross.svg"

type TitleInputProps = {
  title: string
  setTitle: (title: string) => void
  disable?: boolean
}

const TitleInput = forwardRef(
  ({ title, setTitle, disable }: TitleInputProps, ref) => {
    console.log("🔩 TitleInput refresh", title)
    const inputRef = useRef(null)
    const [isEdit, setIsEdit] = useState(false)
    const [inputValue, setInputValue] = useState(title)
    const defaultValueRef = useRef(title)

    const openEdit = () => !disable && setIsEdit(true)
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

    useImperativeHandle(ref, () => ({
      active: openEdit
    }))

    useEffect(() => {
      setInputValue(title)
      defaultValueRef.current = title
    }, [title])

    if (isEdit) {
      return (
        <div className="input-wrapper flex items-center">
          <div id="input-title" className="relative h-auto w-full">
            <input
              type="text"
              autoFocus
              ref={inputRef}
              className="input relative h-auto w-full rounded-none border-0 border-none p-0 text-2xl text-slate-600 outline-none focus:rounded-none focus:outline-none"
              placeholder={inputValue}
              value={inputValue}
              onChange={onChange}
              onBlur={closeEdit}
              onKeyDown={onKeyDown}
            />
          </div>
          <button
            className="btn btn-square btn-outline btn-primary btn-xs m-0.5 flex-none"
            onClick={onSubmit}
            onMouseDown={onMouseDown}
          >
            <Check></Check>
          </button>
          <button
            className="btn btn-square btn-outline btn-primary btn-xs m-0.5 flex-none"
            onClick={closeEdit}
          >
            <Cross></Cross>
          </button>
        </div>
      )
    }

    return (
      <h3
        className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl"
        title={title}
        onClick={openEdit}
      >
        {title}
      </h3>
    )
  }
)

export default TitleInput
