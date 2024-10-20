import type { ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native'

type RenderImageComponentParams = {
  readonly source: ImageSourcePropType
  readonly style?: StyleProp<ImageStyle>
  readonly resizeMode?: ImageResizeMode
  readonly isModalOpen: boolean
}

interface OnMove {
  readonly type: string
  readonly positionX: number
  readonly positionY: number
  readonly scale: number
  readonly zoomCurrentDistance: number
}

interface OnTap {
  readonly locationX: number
  readonly locationY: number
  readonly pageX: number
  readonly pageY: number
}

export type { RenderImageComponentParams, OnMove, OnTap }
