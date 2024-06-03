const List = ({ window }) => {
  const [tabs, setTabs] = useState(window?.tabs ?? [])
  return <p>{JSON.stringify(tabs)}</p>
}
