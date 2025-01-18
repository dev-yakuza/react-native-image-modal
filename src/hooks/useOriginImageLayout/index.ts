import type { RefObject } from 'react'
import { useState } from 'react'

import { Dimensions } from 'react-native'

import type { View } from 'react-native'

interface Params {
  readonly imageRef: RefObject<View | null>
  readonly isRTL: boolean
}

const useOriginImageLayout = ({ imageRef, isRTL }: Params) => {
  const [originImageLayout, setOriginImageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const getModalPositionX = (x: number, width: number): number => {
    if (isRTL) {
      return Dimensions.get('window').width - width - x
    }
    return x
  }

  const updateOriginImageLayout = (): void => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      setOriginImageLayout({
        width,
        height,
        x: getModalPositionX(x, width),
        y,
      })
    })
  }

  Dimensions.addEventListener('change', updateOriginImageLayout)

  return { originImageLayout, updateOriginImageLayout }
}

export { useOriginImageLayout }
