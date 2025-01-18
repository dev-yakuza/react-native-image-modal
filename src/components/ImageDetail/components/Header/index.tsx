import type { ReactNode } from 'react'

import { Animated, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native'

const styles = StyleSheet.create({
  closeButton: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 35,
    color: 'white',
    lineHeight: 40,
    textAlign: 'center',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 1.5,
    shadowColor: 'black',
    shadowOpacity: 0.8,
  },
})

interface Props {
  readonly isTranslucent: boolean
  readonly hideCloseButton: boolean
  readonly renderToHardwareTextureAndroid: boolean
  readonly animatedOpacity: Animated.Value
  renderHeader?(close: () => void): ReactNode
  onClose(): void
}

const Header = ({
  isTranslucent,
  hideCloseButton,
  renderToHardwareTextureAndroid,
  animatedOpacity,
  renderHeader,
  onClose,
}: Props) => {
  if (hideCloseButton) return

  const animationStyle = {
    opacity: animatedOpacity,
  }
  const marginTop = isTranslucent ? StatusBar.currentHeight : 0

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={animationStyle}
    >
      {typeof renderHeader === 'function' ? (
        renderHeader(onClose)
      ) : (
        <SafeAreaView style={{ marginTop }}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.label}>×</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </Animated.View>
  )
}

export { Header }
