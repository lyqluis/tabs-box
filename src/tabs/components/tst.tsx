export const useWindowEvents = () => {
  const { dispatch } = useGlobalCtx()

  const onWindowCreated = async (window) => {
    console.log("👂window created", window)
    const newWindows = windows.slice()
    if (!newWindows.includes(window)) {
      newWindows.push(window)
    }
    dispatch(setWindows(newWindows))
  }
  useEffect(() => {
    chrome.windows.onCreated.addListener(onWindowCreated)

    return () => {
      chrome.windows.onCreated.removeListener(onWindowCreated)
    }
  }, [])
}
