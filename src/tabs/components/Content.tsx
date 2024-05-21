import { useGlobalCtx } from "./context"
import { List } from "./list"
import {
  removeCollection,
  setCollectionWithLocalStorage,
  setWindowOrCollection
} from "./reducer/actions"

const ContentLayout = ({ seletedItem, children }) => {
  const { dispatch } = useGlobalCtx()
  const saveCollection = () => {
    dispatch(setCollectionWithLocalStorage(seletedItem))
  }
  // TODO view does not change after save/delete
  const editCollection = () => {
    // todo
  }
  const deleteCollection = () => dispatch(removeCollection(seletedItem))

  return (
    <>
      <h1>Title:{seletedItem.title}</h1>
      <button
        className="p-2 bg-white border border-solid border-danube-600"
        onClick={saveCollection}>
        save to collection
      </button>
      {/* // TODO only shows when selectedItem is collection */}
      <button
        className="p-2 bg-white border border-solid border-danube-600"
        onClick={editCollection}>
        edit title
      </button>
      <button
        className="p-2 bg-white border border-solid border-danube-600"
        onClick={deleteCollection}>
        delete
      </button>
      {children}
    </>
  )
}

const Content = ({}) => {
  const {
    state: { current, windows, collections },
    dispatch
  } = useGlobalCtx()

  if (!current) return <h1>loading</h1>

  // window
  if (current.tabs) {
    return (
      <>
        <ContentLayout seletedItem={current}>
          <List window={current}></List>
        </ContentLayout>
      </>
    )
  }
  // collection
  const list = current.windows ?? current.folders
  return (
    <>
      <ContentLayout seletedItem={current}>
        {list.map((window) => (
          <List key={window.id} window={window}></List>
        ))}
      </ContentLayout>
    </>
  )
}

export default Content
