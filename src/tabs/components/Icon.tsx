interface IconProps {
  className?: string
  width?: number | string
  height?: number | string
  fill?: string
  Svg: React.FC<React.SVGProps<SVGSVGElement>> // 将 SVG 组件作为 props 传入
}

const Icon: React.FC<IconProps> = ({
  Svg,
  className = "h-5 w-5 fill-slate-700",
  ...props
}) => {
  return <Svg className={className} {...props}></Svg>
}

export default Icon
