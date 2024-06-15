import type { ReactNode, RefObject } from 'react'
import React, { createRef, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { StyleProp, ImageStyle, ImageResizeMode, ImageSourcePropType } from 'react-native'
import { Animated, View, TouchableOpacity, Dimensions, Image } from 'react-native'

import { ImageDetail } from './ImageDetail'
import type { OnTap, OnMove } from './types'

const VISIBLE_OPACITY = 1
const INVISIBLE_OPACITY = 0

type ReactNativeImageModal = {
  readonly isOpen: boolean
  open(): void
  close(): void
}

interface Props {
  readonly source: ImageSourcePropType
  readonly style?: StyleProp<ImageStyle>
  readonly resizeMode?: ImageResizeMode
  readonly isRTL?: boolean
  readonly renderToHardwareTextureAndroid?: boolean
  readonly isTranslucent?: boolean
  readonly swipeToDismiss?: boolean
  readonly imageBackgroundColor?: string
  readonly overlayBackgroundColor?: string
  readonly hideCloseButton?: boolean
  /**
   * @deprecated This prop is deprecated and will be removed in future releases. Use `ref` instead.
   */
  readonly modalRef?: RefObject<ImageDetail>
  readonly disabled?: boolean
  readonly modalImageStyle?: ImageStyle
  readonly modalImageResizeMode?: ImageResizeMode
  readonly parentLayout?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly animationDuration?: number
  renderHeader?(close: () => void): ReactNode
  renderFooter?(close: () => void): ReactNode
  renderImageComponent?(params: {
    readonly source: ImageSourcePropType
    readonly style?: StyleProp<ImageStyle>
    readonly resizeMode?: ImageResizeMode
  }): ReactNode
  onLongPressOriginImage?(): void
  onTap?(eventParams: OnTap): void
  onDoubleTap?(): void
  onLongPress?(): void
  onOpen?(): void
  didOpen?(): void
  onMove?(position: OnMove): void
  responderRelease?(vx?: number, scale?: number): void
  willClose?(): void
  onClose?(): void
}

const ImageModal = forwardRef<ReactNativeImageModal, Props>(
  (
    {
      source,
      style,
      resizeMode = 'contain',
      isRTL,
      renderToHardwareTextureAndroid = true,
      isTranslucent,
      swipeToDismiss = true,
      imageBackgroundColor,
      overlayBackgroundColor,
      hideCloseButton,
      modalRef,
      disabled,
      modalImageStyle,
      modalImageResizeMode,
      parentLayout,
      animationDuration = 100,
      onLongPressOriginImage,
      renderHeader,
      renderFooter,
      renderImageComponent,
      onTap,
      onDoubleTap,
      onLongPress,
      onOpen,
      didOpen,
      onMove,
      responderRelease,
      willClose,
      onClose,
    }: Props,
    ref,
  ) => {
    const imageRef = createRef<View>()
    const imageOpacity = useRef(new Animated.Value(VISIBLE_OPACITY)).current
    const imageDetailRef = modalRef ?? useRef<ImageDetail>(null)

    const [modalInitialPosition, setModalInitialPosition] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    })
    const [isModalOpen, setIsModalOpen] = useState(false)

    const getModalPositionX = (x: number, width: number): number => {
      if (isRTL) {
        return Dimensions.get('window').width - width - x
      }
      return x
    }
    const updateModalInitialPosition = (): void => {
      imageRef.current?.measureInWindow((x, y, width, height) => {
        setModalInitialPosition({
          width,
          height,
          x: getModalPositionX(x, width),
          y,
        })
      })
    }
    Dimensions.addEventListener('change', updateModalInitialPosition)

    const showModal = (): void => {
      onOpen?.()
      updateModalInitialPosition()
      setTimeout(() => {
        setIsModalOpen(true)
      })
    }
    const hideModal = (): void => {
      setTimeout(() => {
        setIsModalOpen(false)
        onClose?.()
      })
    }

    const handleOpen = (): void => {
      showModal()
      Animated.timing(imageOpacity, {
        toValue: INVISIBLE_OPACITY,
        duration: 100,
        useNativeDriver: false,
      }).start()
    }

    const handleClose = (): void => {
      imageOpacity.setValue(VISIBLE_OPACITY)
      hideModal()
    }

    useImperativeHandle(ref, () => ({
      isOpen: isModalOpen,
      open() {
        handleOpen()
      },
      close() {
        imageDetailRef?.current?.close()
      },
    }))

    return (
      <View
        ref={imageRef}
        onLayout={() => {}}
        style={[{ alignSelf: 'baseline', backgroundColor: imageBackgroundColor }]}
      >
        <Animated.View
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          style={{ opacity: imageOpacity }}
        >
          <TouchableOpacity
            activeOpacity={VISIBLE_OPACITY}
            style={{ alignSelf: 'baseline' }}
            onPress={disabled ? undefined : handleOpen}
            onLongPress={onLongPressOriginImage}
          >
            {typeof renderImageComponent === 'function' ? (
              renderImageComponent({
                source,
                style,
                resizeMode,
              })
            ) : (
              <Image source={source} style={style} resizeMode={resizeMode} />
            )}
          </TouchableOpacity>
        </Animated.View>
        {isModalOpen && (
          <ImageDetail
            source={source}
            resizeMode={modalImageResizeMode ?? resizeMode}
            imageStyle={modalImageStyle}
            ref={modalRef ?? imageDetailRef}
            isOpen={isModalOpen}
            renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
            isTranslucent={isTranslucent}
            origin={modalInitialPosition}
            backgroundColor={overlayBackgroundColor}
            swipeToDismiss={swipeToDismiss}
            hideCloseButton={hideCloseButton}
            parentLayout={parentLayout}
            animationDuration={animationDuration}
            renderHeader={renderHeader}
            renderFooter={renderFooter}
            renderImageComponent={renderImageComponent}
            onTap={onTap}
            onDoubleTap={onDoubleTap}
            onLongPress={onLongPress}
            didOpen={didOpen}
            onMove={onMove}
            responderRelease={responderRelease}
            willClose={willClose}
            onClose={handleClose}
          />
        )}
      </View>
    )
  },
)

export default ImageModal
export type { ReactNativeImageModal, ImageDetail }
