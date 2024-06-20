import type { ReactNode } from 'react'
import React from 'react'
import { Animated, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native'

const Styles = StyleSheet.create({
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
  readonly children?: ReactNode
  onClose(): void
}

const Header = ({
  isTranslucent,
  hideCloseButton,
  renderToHardwareTextureAndroid,
  animatedOpacity,
  children,
  onClose,
}: Props) => {
  if (hideCloseButton) return

  return (
    <Animated.View
      renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      style={[
        {
          opacity: animatedOpacity,
        },
      ]}
    >
      {children ? (
        children
      ) : (
        <SafeAreaView style={{ marginTop: isTranslucent ? StatusBar.currentHeight : 0 }}>
          <TouchableOpacity style={Styles['closeButton']} onPress={onClose}>
            <Text style={Styles['label']}>×</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </Animated.View>
  )
}

export { Header }
