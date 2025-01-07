# TODO
- [x] sortable feature
  - sortable only with handle icon
- [x] App
  - [x] use global data through context
- [x] SideBar
  - [x] show pinned item
  - [x] scroll y
  - [x] show updated time
- [-] List
  - [ ] how to distinguish whether the current window is from a collection or a new one unsaved
  - [ ] style: URL that exceeds fades out with a gradient
  - [x] edit window title
    - [x] input feature
      - use mousedown event to prevent blur event from being fired before the click of buttons
    - [x] click title to switch to edit mode
    - [x] switch back to title
    - [x] save edited collection
  - [x] reactive tabs number
  - [x] reactive update time
  - [x] icon
    - [x] show pinned
  - [x] detect tabs witch are loading
  - [x] open collection feature
  - [x] selected feature
    - [x] select all
    - [x] delete selected from window
    - [x] delete selected from collection
    - [x] click outside list, cancel all selected
    - [x] collection with multi windows works wrong, select tabs in one window, another window of collections' shows select box as well
    - [x] refactor from data mode to state
  - [x] quick actions to open window / delete window
  - [x] list's draggable handler, dnd style
  - [x] list's dnd overlay
  - [x] style: collection/window actions button and title in one line
- [x] feature: integrate collections' operational functions into `useActions` hook
  - [x] move old functions into hook file
- [x] feature: copy/paste
- [x] feature: open url/window/collection
  - [x] open colleciton in new window
  - [x] open one tab / tabs selected
  - [x] open one window / windows selected
- [x] feature: real-time monitoring of the tabs/windows while staying on the app page
  - on tab crated, updated, removed, moved
  - on window crated, removed, [-] bound change
- [x] feature: apply/save changes to windows/local
  - [x] apply/save button
    - when window/collection edited, apply/save button should change to a red/eye-catching color to remind users to click
    - [x] when save/apply, check if the collection/window is empty
  - [x] window's apply feature
  - [x] collection's save feature
    - [x] multi windows save in one collection
  - [x] bugs: can't close duplicated tabs in window
- [x] Dialog Box
  - create a global `Dialog`, use `useReducer` to store Dialog state
  - use gobal context `DialogProvider` to provide `openDialog` and `closeDialog` methods to other component
  - `useDialog` hook provides a custom hook that allows any child component to conveniently access the dialog control methods.
  - by passing different content components through the `openDialog` method, dynamic changes of the dialog content are achieved
- [x] notification feature
  - 1. use `useImperativeHandle` hook to expose taost api to the outside (https://juejin.cn/post/7330602636935561255)
  ```tsx
  // toast object to export api to outside
  export const toast: { current: IToastRef | null } = { current: null }

  const ToastContainer = () => {
    // internal custom ref
    const toastRef = useRef<IToastRef>(null)
    const [toastList, setToastList] = useState<
      { id: string; msg: string; duration?: number }[]
    >([])

    // expose api to internal ref `toastRef`
    useImperativeHandle(toastRef, () => {
      return {
        // api-info
        info: (msg: string, option) => {
          const item = {
            msg,
            duration: option?.duration,
            id: `${+new Date()}`
          }
          return setToastList((list) => [...list, item])
        }
      }
    })
    // set external `toast.current` point to internal ref
    useEffect(() => {
      toast.current = toastRef.current
    }, [])

    return (
      <div className="fixed left-0 right-0 top-0 z-[999]">
        {toastList.map((item) => {
          return (
            <ToastMessage key={item.id} {...item}>
              {item.msg}
            </ToastMessage>
          )
        })}
      </div>
    )
  }

  
  const ToastMessage = ({
    id,
    message = "You have 1 unread message",
    duration = 3000,
    children = null,
    cancelText = null,
    confirmText = null
  }) => {
    const [isShow, setIsShow] = useState(false)
    const transitionDuration = 300

    // set isShow to control CSS transition, otherwise transition will not work
    useEffect(() => {
      setIsShow(true)
      setTimeout(() => {
        setIsShow(false)
        // make sure disappeat transition works
        setTimeout(() => {
          toast.current?.close(id)
        }, transitionDuration)
      }, duration)
    }, [])

    return (
      <div
        role="alert"
        className={`alert m-1.5 shadow-lg transition-all ${duration-transitionDuration} ease-linear ${isShow ? "translate-x-0" : "translate-x-full opacity-0"}`}
      >
      // ...
      </div>
    )
  }
  ```
  - 2. use `useSyncExternalStore` to subscribe to an external store and message list (https://juejin.cn/post/7223705034412802107#heading-10)
  - [-] bugs
    - [x] transition animations for conditional rendering
- [x] export & import feature
  - [x] data foramt
  - [x] import
    - import -> reducer -> local save
    - [x] import compatible with format Session Buddy
  - [x] export
    - local save -(initial render)-> reducer -> export
- [x] data & local
  - [x] save through indexedDB
  - [x] add/set collection, toggle 'save' to save to the collections
  - [x] save sortable data
    - after drag sorted, update the new list data update in the reducer without local storage
  - [x] delete collection
  - [x] collection with multi windows
- [ ] setting feature
- [ ] restore feature
  - [ ] save last save (only useful to collections)
  - [?] any operations of the list should be push into history stack
- [ ] bugs
  - [x] update collection should auto update sort in SideBar
  - [x] click url to open tab in ListItem
  - [x] delete tab can not detecte
  - [x] List: new tab can not be detected in reducer when deleted
  - [x] move selected to other collection, moved tabs should be detected by useSelected or unchecked
  - [x] multi drag end, the collapsed tabs cannot be restored to their expanded state
  - [x] new pinned item should be auto sort to the top
  - [x] copy / paste logic
    - [x] copy tabs as new window
    - [x] copy tabs to target window
    - [x] copy window to new collection / as new window
    - [x] copy window to target window (same to the 2nd)
    - [x] copy collection as new collection (clone)
  - [x] drag/add/copy window to other collection, while window dragging in the new collection, the new window does not shrink
  - [x] tabs in new added window can not be selected
  - [x] export
  - [?] **dragging in cloned collection doesn't work well**
- [x] enhance: export async function & dialog
  - add a dialog to show the export status
- [x] abstract save locally function
- [x] save/clone/copy window/collection, add tab.window, window.collection
- [-] searh
  - fuse.js
  - [x] hightlight in search result
  - [x] hightlight in listitem when click search result
  - [x] hightlight in listitem when search query exists
  - [x] when input, `/` key event should be default
  - [x] when input, `esc` key display
  - [x] when search without reuslt, do not show search result list
  - [x] escape input '\' to create regexp
  - [x] add windows in search data, add window as search result
  - [ ] **hightlight in list & sidebar when search query exists**
- [ ] incognito mode
  - [ ] filter search result with incognito
- [ ] **feature: save file in cloud**
- [x] feature: drag tabs between windows
  - Sortable / App
  - dnd context
    - Sidbar
      - Sidebar Item
      - dropable container
    - Content
    - sortable context
      - List (window)
      - droppable container
      - sortable context
        - List Item (tab)
        - useSortable

### component
- list => window
  - select list
  - list operations
  - list item => window's tab

### data save

component -> context/reducer -> local

- window
  add / remove / sort --> reducer
  => component --[apply]--> local
- collection
  add / remove / sort --> reducer
  => component --[?save]--> local

### drag tabs
- window's tabs ==> collection's window / window
- collection's tabs =x=> window
- collection's tabs ==> collection's window

- [x] collection
  1. [x] drag tabs in the same window/list
    => update list order
  2. [x] drag tabs to another window/list(same collection)
    => update old window tabs, new window tabs and order
  3. [x] drag tabs to another collection
    => remove tabs from window of old collection, add new window with tabs to new collection
  4. [x] drag window to another collection
    => remove window from old collection, add window to new collection
  - [x] save drag changes locally

- [x] window
  1. [x] drag tabs in the same window/list
    => update list order
  2. [x] drag tabs to another window(sidebar)
    => update new window tabs list
  3. [x] drag tabs to another collection
    => add new window with tabs to new collection
  - [x] apply drag changes to windows
