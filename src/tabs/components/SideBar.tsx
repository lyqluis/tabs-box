import "../style"

const SideBar = ({ windows, selectWindow, currentIdx }) => {
  return (
    <aside className="w-1/3 min-w-52 h-lvh px-3.5 
    bg-gradient-to-b  from-danube-700 to-danube-600 
    text-danube-200 text-base font-medium">
      <h1>side bar</h1>
      <h2>windows</h2>
      <ul className="">
        {windows.map((window, i) => (
          <li
            key={window.id}
            className={`mb-2.5 px-3.5 w-full h-20 rounded-md
            hover:bg-danube-800 hover:text-danube-50 
            flex content-center items-center 
            shadow font-light
            ${i === currentIdx ? "bg-danube-800 text-danube-50 font-medium" : ""} 
            `}
            onClick={selectWindow(i)}>
            window: {window.focused ? "current" : window.id}
          </li>
        ))}
      </ul>
      <h2>collections</h2>
      <ul className="px-3.5">
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
      <button className="p-5 w-20 h-20 rounded-full bg-danube-600">
        setting
      </button>
    </aside>
  )
}

export default SideBar
