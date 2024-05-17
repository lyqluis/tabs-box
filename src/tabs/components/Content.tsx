import { List } from "./list"

const Content = ({ selectedItem }) => {
  // window
  if (selectedItem.tabs) {
    return <List window={selectedItem}></List>
  }
  // collection
  const list = selectedItem.folders ?? selectedItem.windows
  return (
    <>
      {list.map((window) => (
        <List window={window} key={window.id}></List>
      ))}
    </>
  )
}

export default Content
