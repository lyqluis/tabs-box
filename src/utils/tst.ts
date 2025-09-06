// 方案1
const LiIcon = ({ type, status, favIconUrl }) => {
	return (
		<span className='m-0.5 flex w-6 flex-none items-center justify-center'>
			{type === "window" && status === "loading" ? (
				<span className='loading loading-spinner loading-sm text-gray-500'></span>
			) : (
				<Favicon url={favIconUrl} />
			)}
		</span>
	)
}

const ListItem = ({...}) => {
  return (
    // ...other nodes
    <LiIcon type={type} status={tab.status} favIconUrl={tab.favIconUrl}/>
    // ...other nodes
  )
}

// 方案2
const ListItem = ({...}) => {
  return (
    // ...other nodes
    <span className='m-0.5 flex w-6 flex-none items-center justify-center'>
			{type === "window" && tab.status === "loading" ? (
				<span className='loading loading-spinner loading-sm text-gray-500'></span>
			) : (
				<Favicon url={tab.favIconUrl} />
			)}
		</span>   
    // ...other nodes
  )
}