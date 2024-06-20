import type { ReactNode } from 'react'
import React from 'react'
import { Animated, Dimensions, StyleSheet } from 'react-native'

const Styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
})

interface Props {
  readonly renderToHardwareTextureAndroid: boolean
  readonly animatedOpacity: Animated.Value
  readonly children: ReactNode
}

const Footer = ({ renderToHardwareTextureAndroid, animatedOpacity, children }: Props) => {
  const { height: windowHeight } = Dimensions.get('window')

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        Styles['footer'],
        {
          opacity: animatedOpacity.interpolate({
            inputRange: [0, windowHeight],
            outputRange: [1, 0],
          }),
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

export { Footer }
