import { Animated, StyleSheet } from 'react-native'

import type { ColorValue } from 'react-native'

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
})

interface Props {
  readonly animatedOpacity: Animated.Value
  readonly backgroundColor: ColorValue
  readonly renderToHardwareTextureAndroid: boolean
}

const Background = ({
  animatedOpacity,
  backgroundColor,
  renderToHardwareTextureAndroid,
}: Props) => {
  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[styles.background, { backgroundColor }, { opacity: animatedOpacity }]}
    />
  )
}

export { Background }
