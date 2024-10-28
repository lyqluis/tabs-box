在一个自定义勾子函数内有如下一个组件和激活该组件的方法：
```jsx
// useCollectionTitle
const titleInputRef = useRef(null)
const CollectionTitle = (
  <TitleInput
    title={current.title ?? (isCurrentWindow ? "This Window" : "Window")}
    disable={type === "window"}
    setTitle={setCollectionTitle}
    ref={titleInputRef}
  />
)
const activeTitleInput = () => {
  console.log("active title input", titleInputRef)
  titleInputRef.current.active()
}
return { CollectionTitle, activeTitleInput }
```
然后在另外一个组件中调用该勾子引入该组件：
```jsx
// Component A
const { CollectionTitle } = useCollectionTitle()
return (
  <>
    <CollectionTitle />
  </>
)
```
在另一个组件中引入激活该组件的方法：
```jsx
// Component B
const { activeTitleInput } = useCollectionTitle()
return (
  <button onClick={activeTitleInput}>Active Title Input</button>
)
```
但是点击组件B的时候无法生效，请问我该如何解决？