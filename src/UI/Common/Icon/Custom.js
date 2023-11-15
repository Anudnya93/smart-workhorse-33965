import * as React from 'react'
import { Icons } from '../../../res/Svgs'

export default function CustomIcon(props) {
  const { name = '', size, style, width, fill = 'transparent' } = props
  const SVG = Icons[name]
  return <SVG height={size} width={width || size} style={style} fill={fill} />
}
