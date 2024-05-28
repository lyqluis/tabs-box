import { useEffect, useRef, useState } from "react"
import Check from "react:~assets/svg/check.svg"
import Cross from "react:~assets/svg/cross.svg"

const TitleInput = ({ title, setTitle, disable }) => {
  console.log("🔩 TitleInput refresh", title)

  const [isEdit, setIsEdit] = useState(false)
  const [inputValue, setInputValue] = useState(title)
  const openEdit = () => setIsEdit(true)
  // TODO blur is fired ahead of button click to update colletion's title
  const closeEdit = () => {
    setTimeout(() => {
      console.log("close & reset edit")
      setInputValue(title)
      setIsEdit(false)
    })
  }
  const onChange = (e) => setInputValue(e.target.value)
  const onSubmit = (e?) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("on submit")
    setTitle(inputValue)
  }
  const onKeyDown = (e) => {
    if (e && e.key === "Enter") {
      onSubmit()
    }
  }

  useEffect(() => {
    setInputValue(title)
  }, [title])

  if (disable)
    return <h3 className="text-2xl h-7 flex items-center">{title}</h3>

  if (isEdit) {
    return (
      <div className="input-wrapper flex items-center h-7">
        <input
          type="text"
          autoFocus
          className="input w-auto h-7 text-2xl text-slate-600 border-0 border-none rounded-none outline-none focus:rounded-none focus:outline-none focus:border-b focus:border-slate-600 focus:border-solid leading-none p-0"
          placeholder={inputValue}
          value={inputValue}
          onChange={onChange}
          onBlur={closeEdit}
          onKeyDown={onKeyDown}
        />
        <button
          className="flex-none btn btn-xs btn-square btn-outline m-0.5 btn-primary"
          onClick={onSubmit}>
          <Check></Check>
        </button>
        <button
          className="flex-none btn btn-xs btn-square btn-outline m-0.5 btn-primary"
          onClick={closeEdit}>
          <Cross></Cross>
        </button>
      </div>
    )
  }

  return (
    <h3 className="text-2xl h-7 flex items-center" onClick={openEdit}>
      {title}
    </h3>
  )
}

export default TitleInput
