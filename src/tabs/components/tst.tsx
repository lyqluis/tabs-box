import "./tst.css"

export const Tst = ({}) => {
  const Item = <li className="list-item">content</li>
  const list = new Array(50).fill(Item)

  return (
    <>
      <div className="header">header</div>
      <div className="content scrollbar">
        <div className="list">{list.map((Item) => Item)}</div>
        {/* {list.map((Item) => Item)} */}
      </div>
    </>
  )
}
