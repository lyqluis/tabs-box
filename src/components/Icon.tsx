interface IconProps extends React.ComponentPropsWithoutRef<"svg"> {
  className?: string
  width?: number | string
  height?: number | string
  fill?: string // fill-color
  type?: "default" | "warn" | "disabled" | "success"
  Svg: React.FC<React.SVGProps<SVGSVGElement>> // 将 SVG 组件作为 props 传入
}

// const defaultSize = "h-5 w-5"
// const defaultColor: "fill-slate-700",
const fillStyles = {
  default: "",
  warn: "fill-red-500",
  disabled: "fill-slate-300",
  success: "fill-green-500"
}

// ? is it necessary to set a default <i> to wrapper <svg>
const Icon: React.FC<IconProps> = ({
  Svg,
  className,
  type,
  width = 5,
  height = 5,
  fill,
  ...props
}) => {
  const size =
    width && height
      ? `h-${width} w-${height}`
      : `h-${width ?? "auto"} w-${height ?? "auto"}`
  const fillColor = fill ?? fillStyles[type ?? "default"]
  const iconStyle = size + " " + fillColor
  const iconClassName = className ?? iconStyle

  return <Svg className={iconClassName} {...props}></Svg>
}

export default Icon
