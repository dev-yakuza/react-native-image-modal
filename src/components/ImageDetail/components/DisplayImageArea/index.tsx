import type { ReactNode } from 'react'

import { Animated, Dimensions, Platform, StatusBar, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  clippingArea: {
    position: 'absolute',
  },
})

interface Props {
  readonly animatedFrame: Animated.Value
  readonly parentLayout?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly isTranslucent: boolean
  readonly renderToHardwareTextureAndroid: boolean
  readonly children: ReactNode
}

const DisplayImageArea = ({
  animatedFrame,
  parentLayout,
  isTranslucent,
  renderToHardwareTextureAndroid,
  children,
}: Props) => {
  // When parentLayout is not passed in the props,
  // clipping is not needed, so clipping area should be full screen.
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window')

  // On Android, the status bar height should be added to the top position of the clipping area.
  const statusBarHeight =
    isTranslucent && Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0

  const animationStyle = {
    left: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.x ?? 0, 0],
    }),
    top: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [(parentLayout?.y ?? 0) + statusBarHeight, 0],
    }),
    width: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.width ?? windowWidth, windowWidth],
    }),
    height: animatedFrame.interpolate({
      inputRange: [0, 1],
      outputRange: [parentLayout?.height ?? windowHeight, windowHeight],
    }),
  }

  return (
    <Animated.View
      style={[styles.clippingArea, animationStyle]}
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
    >
      {children}
    </Animated.View>
  )
}

export { DisplayImageArea }
