import { useGlobalCtx } from "./context"
import { List } from "./list"
import {
  removeCollection,
  setCollectionWithLocalStorage
} from "./reducer/actions"
import TitleInput from "./TitleInput"

let count = 0
const ContentLayout = ({ selectedItem, children }) => {
  const { dispatch } = useGlobalCtx()
  const type = selectedItem.created ? "collection" : "window"
  const saveCollection = () => {
    dispatch(setCollectionWithLocalStorage(selectedItem))
  }
  const editCollection = () => {
    // dispatch(setCollectionWithLocalStorage(collection))
  }
  const deleteCollection = () => dispatch(removeCollection(selectedItem))
  const setCollectionTitle = (title) => {
    console.log("set collection title", title)
    selectedItem.title = title
    dispatch(setCollectionWithLocalStorage(selectedItem))
  }

  return (
    <>
      <div className="title-container flex items-center">
        <div className="avatar placeholder flex-none grow-0 shrink-0">
          <div className="bg-neutral text-neutral-content rounded-full w-12">
            <span className="text-xl">
              {/* // TODO type is window, use window icon */}
              {selectedItem.title && selectedItem.title[0].toUpperCase()}
            </span>
          </div>
        </div>
        <div className="title__detail m-2">
          <TitleInput
            title={selectedItem.title ?? "Window"}
            disable={type === "window"}
            setTitle={setCollectionTitle}></TitleInput>
          <p className="my-2">
            <span>7 tabs</span> | updated 7 minutes ago
          </p>
        </div>
      </div>
      <button
        className="btn btn-outline btn-primary p-2"
        onClick={saveCollection}>
        save to collection
      </button>
      {/* // TODO only shows when selectedItem is collection */}
      <button
        className="btn btn-outline btn-primary p-2"
        onClick={editCollection}>
        edit title
      </button>
      <button
        className="btn btn-outline btn-primary p-2"
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
        <ContentLayout selectedItem={current}>
          <List window={current}></List>
        </ContentLayout>
      </>
    )
  }
  // collection
  const list = current.windows ?? current.folders
  return (
    <>
      <ContentLayout selectedItem={current}>
        {list.map((window) => (
          <List key={window.id} window={window}></List>
        ))}
      </ContentLayout>
    </>
  )
}

export default Content
