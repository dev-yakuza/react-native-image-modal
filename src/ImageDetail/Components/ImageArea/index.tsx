import type { ReactNode } from 'react'
import type { ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native'
import { StyleSheet, Image } from 'react-native'
import { Animated } from 'react-native'

const Styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
})

interface Props {
  readonly renderToHardwareTextureAndroid: boolean
  readonly animatedScale: Animated.Value
  readonly animatedPosition: Animated.ValueXY
  readonly imagePosition: Animated.ValueXY
  readonly imageWidth: Animated.Value
  readonly imageHeight: Animated.Value
  readonly source: ImageSourcePropType
  readonly resizeMode?: ImageResizeMode
  readonly imageStyle?: StyleProp<ImageStyle>
  renderImageComponent?(params: {
    readonly source: ImageSourcePropType
    readonly style?: StyleProp<ImageStyle>
    readonly resizeMode?: ImageResizeMode
  }): ReactNode
}

const ImageArea = ({
  renderToHardwareTextureAndroid,
  animatedScale,
  animatedPosition,
  imagePosition,
  imageWidth,
  imageHeight,
  source,
  resizeMode,
  imageStyle,
  renderImageComponent,
}: Props) => {
  const animateConf = {
    transform: [
      {
        scale: animatedScale,
      },
      {
        translateX: animatedPosition.x,
      },
      {
        translateY: animatedPosition.y,
      },
    ],
    left: imagePosition.x,
    top: imagePosition.y,
    width: imageWidth,
    height: imageHeight,
  }

  return (
    <Animated.View
      style={animateConf}
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
    >
      {typeof renderImageComponent === 'function' ? (
        renderImageComponent({
          source,
          resizeMode,
          style: [imageStyle, Styles['image']],
        })
      ) : (
        <Image resizeMode={resizeMode} style={[imageStyle, Styles['image']]} source={source} />
      )}
    </Animated.View>
  )
}

export { ImageArea }
