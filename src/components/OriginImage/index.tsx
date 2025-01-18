import type { ReactNode } from 'react'

import { Animated, Image, TouchableOpacity } from 'react-native'

import type { RenderImageComponentParams } from '../../types'
import type { ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native'

interface Props {
  readonly source: ImageSourcePropType
  readonly resizeMode: ImageResizeMode
  readonly imageOpacity: Animated.Value
  readonly renderToHardwareTextureAndroid: boolean
  readonly disabled: boolean
  readonly style?: StyleProp<ImageStyle>
  readonly isModalOpen: boolean
  onDialogOpen(): void
  onLongPressOriginImage?(): void
  renderImageComponent?(params: RenderImageComponentParams): ReactNode
}

const OriginImage = ({
  source,
  resizeMode,
  imageOpacity,
  renderToHardwareTextureAndroid,
  disabled,
  style,
  isModalOpen,
  onDialogOpen,
  onLongPressOriginImage,
  renderImageComponent,
}: Props) => {
  const handleOpen = (): void => {
    if (disabled) {
      return
    }
    onDialogOpen()
  }

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[{ opacity: imageOpacity }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{ alignSelf: 'baseline' }}
        onPress={handleOpen}
        onLongPress={onLongPressOriginImage}
      >
        {typeof renderImageComponent === 'function' ? (
          renderImageComponent({
            source,
            style,
            resizeMode,
            isModalOpen,
          })
        ) : (
          <Image source={source} style={style} resizeMode={resizeMode} />
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export { OriginImage }
