interface IconProps {
  className?: string
  width?: number | string
  height?: number | string
  fill?: string
  type?: "default" | "warn" | "disabled" | "success"
  Svg: React.FC<React.SVGProps<SVGSVGElement>> // 将 SVG 组件作为 props 传入
}

const defaultSize = "h-5 w-5"
const iconStyles = {
  default: "fill-slate-700",
  warn: "fill-red-500",
  disabled: "fill-slate-300",
  success: "fill-green-500"
}

// ? is it necessary to set a default <i> to wrapper <svg>
const Icon: React.FC<IconProps> = ({ Svg, className, type, ...props }) => {
  const iconStyle = defaultSize + " " + iconStyles[type ?? "default"]
  const iconClassName = className ? iconStyle + " " + className : iconStyle

  return <Svg className={iconClassName} {...props}></Svg>
}

export default Icon
