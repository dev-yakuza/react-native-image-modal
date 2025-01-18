import type { ReactNode } from 'react'

import { Animated, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
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
  renderFooter?(close: () => void): ReactNode
  onClose(): void
}

const Footer = ({
  renderToHardwareTextureAndroid,
  animatedOpacity,
  renderFooter,
  onClose,
}: Props) => {
  if (typeof renderFooter !== 'function') {
    return
  }

  const animationStyle = {
    opacity: animatedOpacity,
  }

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[styles['footer'], animationStyle]}
    >
      {renderFooter(onClose)}
    </Animated.View>
  )
}

export { Footer }
