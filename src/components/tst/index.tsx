import { fromNow } from "@/utils"

import CloudFileSync from "../CloudFileSync"
import HeaderActionButtons from "../HeaderActionButtons"
import Icon from "../Icon"
import { highlight, Search } from "../search/searchContext"
import { SettingsButton } from "../setting/settingContext"

const Tst = () => (
  <li
    className={
      "hover:bg-primary hover:text-primary-content flex h-20 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-md p-3.5 shadow-md"
    }
  >
    <p className="flex items-center justify-between overflow-hidden leading-tight">
      {/* TODO: if item.隐身模式, font color grey */}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        title
      </span>
      <Icon
        Svg={Pinned}
        className={"flex h-5 w-5 flex-none items-center justify-start"}
      />
    </p>
    <p className="text-xs font-light">Updated</p>
    <button className="absolute top-1/2 right-4 hidden -translate-y-1/2 transform rounded-full p-1 transition-colors group-hover:block hover:bg-gray-200 dark:hover:bg-gray-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </button>
  </li>
)
