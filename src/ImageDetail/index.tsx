import type { ReactNode } from 'react'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { ImageResizeMode, StyleProp, ImageStyle, ImageSourcePropType } from 'react-native'
import { Dimensions, Animated, Modal } from 'react-native'

import type { OnTap, OnMove } from '../types'
import { Background, DisplayImageArea, Footer, Header, ImageArea } from './Components'

const INITIAL_SCALE = 1

interface ImageDetail {
  close(): void
}

interface Props {
  readonly renderToHardwareTextureAndroid: boolean
  readonly isTranslucent?: boolean
  readonly isOpen: boolean
  readonly origin: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly source: ImageSourcePropType
  readonly resizeMode?: ImageResizeMode
  readonly backgroundColor?: string
  readonly swipeToDismiss?: boolean
  readonly hideCloseButton?: boolean
  readonly imageStyle?: StyleProp<ImageStyle>
  readonly parentLayout?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly animationDuration: number
  renderHeader?(close: () => void): ReactNode
  renderFooter?(close: () => void): ReactNode
  renderImageComponent?(params: {
    readonly source: ImageSourcePropType
    readonly style?: StyleProp<ImageStyle>
    readonly resizeMode?: ImageResizeMode
  }): ReactNode
  onTap?(eventParams: OnTap): void
  onDoubleTap?(): void
  onLongPress?(): void
  didOpen?(): void
  onMove?(position: OnMove): void
  responderRelease?(vx?: number, scale?: number): void
  willClose?(): void
  onClose(): void
}

const ImageDetail = forwardRef<ImageDetail, Props>(
  (
    {
      renderToHardwareTextureAndroid,
      isTranslucent = false,
      isOpen,
      origin,
      source,
      resizeMode = 'contain',
      backgroundColor = '#000000',
      swipeToDismiss,
      hideCloseButton = false,
      imageStyle,
      parentLayout,
      animationDuration,
      renderHeader,
      renderFooter,
      renderImageComponent,
      onTap,
      onDoubleTap,
      onLongPress,
      didOpen,
      onMove,
      responderRelease,
      willClose,
      onClose,
    }: Props,
    ref,
  ) => {
    const imageOriginX = origin.x - (parentLayout?.x ?? 0) / 2
    const imageOriginY = origin.y - (parentLayout?.y ?? 0)
    const imageOriginWidth = origin.width
    const imageOriginHeight = origin.height

    const { width: windowWidth, height: windowHeight } = Dimensions.get('window')

    const _animatedScale = new Animated.Value(INITIAL_SCALE)
    const _animatedPosition = new Animated.ValueXY({ x: 0, y: 0 })
    const _animatedFrame = new Animated.Value(0)
    const _animatedOpacity = new Animated.Value(0)
    const _imagePosition = new Animated.ValueXY({ x: imageOriginX, y: imageOriginY })
    const _imageWidth = new Animated.Value(imageOriginWidth)
    const _imageHeight = new Animated.Value(imageOriginHeight)

    const _isAnimated = useRef(true)

    const handleClose = (): void => {
      setTimeout(() => {
        _isAnimated.current = true
        willClose?.()

        Animated.parallel([
          Animated.timing(_animatedScale, {
            toValue: INITIAL_SCALE,
            useNativeDriver: false,
            duration: animationDuration,
          }),
          Animated.timing(_animatedPosition, {
            toValue: 0,
            useNativeDriver: false,
            duration: animationDuration,
          }),
          Animated.timing(_animatedOpacity, {
            toValue: 0,
            useNativeDriver: false,
            duration: animationDuration,
          }),
          Animated.timing(_imagePosition, {
            toValue: {
              x: imageOriginX,
              y: imageOriginY,
            },
            useNativeDriver: false,
            duration: animationDuration * 2,
          }),
          Animated.timing(_imageWidth, {
            toValue: imageOriginWidth,
            useNativeDriver: false,
            duration: animationDuration * 2,
          }),
          Animated.timing(_imageHeight, {
            toValue: imageOriginHeight,
            useNativeDriver: false,
            duration: animationDuration * 2,
          }),
          Animated.spring(_animatedFrame, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start(() => {
          onClose()
          _isAnimated.current = false
        })
      })
    }

    const handleOpen = () => {
      Animated.parallel([
        Animated.timing(_animatedOpacity, {
          toValue: 1,
          useNativeDriver: false,
          duration: animationDuration,
        }),
        Animated.timing(_imagePosition, {
          toValue: {
            x: 0,
            y: 0,
          },
          useNativeDriver: false,
          duration: animationDuration * 2,
        }),
        Animated.timing(_imageWidth, {
          toValue: windowWidth,
          useNativeDriver: false,
          duration: animationDuration * 2,
        }),
        Animated.timing(_imageHeight, {
          toValue: windowHeight,
          useNativeDriver: false,
          duration: animationDuration * 2,
        }),
        Animated.spring(_animatedFrame, {
          toValue: 1,
          useNativeDriver: false,
        }),
      ]).start(() => {
        _isAnimated.current = false
        if (isOpen) {
          didOpen?.()
        }
      })
    }

    useEffect(() => {
      handleOpen()
    }, [_animatedOpacity, _imagePosition, _imageWidth, _imageHeight, _animatedFrame])

    useImperativeHandle(ref, () => ({
      close() {
        handleClose()
      },
    }))

    return (
      <Modal
        hardwareAccelerated
        visible={isOpen}
        transparent
        statusBarTranslucent={isTranslucent}
        onRequestClose={handleClose}
        supportedOrientations={[
          'portrait',
          'portrait-upside-down',
          'landscape',
          'landscape-left',
          'landscape-right',
        ]}
      >
        <Background
          animatedOpacity={_animatedOpacity}
          backgroundColor={backgroundColor}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        />
        <DisplayImageArea
          animatedFrame={_animatedFrame}
          parentLayout={parentLayout}
          isTranslucent={isTranslucent}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        >
          <ImageArea
            renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
            isAnimated={_isAnimated}
            animatedOpacity={_animatedOpacity}
            animatedScale={_animatedScale}
            animatedPosition={_animatedPosition}
            imagePosition={_imagePosition}
            imageWidth={_imageWidth}
            imageHeight={_imageHeight}
            windowWidth={windowWidth}
            windowHeight={windowHeight}
            swipeToDismiss={swipeToDismiss}
            source={source}
            resizeMode={resizeMode}
            imageStyle={imageStyle}
            animationDuration={animationDuration}
            renderImageComponent={renderImageComponent}
            onClose={handleClose}
            onMove={onMove}
            onTap={onTap}
            onDoubleTap={onDoubleTap}
            onLongPress={onLongPress}
            responderRelease={responderRelease}
          />
        </DisplayImageArea>
        <Header
          isTranslucent={isTranslucent}
          hideCloseButton={hideCloseButton}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          animatedOpacity={_animatedOpacity}
          onClose={handleClose}
        >
          {typeof renderHeader === 'function' ? renderHeader(handleClose) : undefined}
        </Header>
        {typeof renderFooter === 'function' && (
          <Footer
            renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
            animatedOpacity={_animatedOpacity}
          >
            {renderFooter(handleClose)}
          </Footer>
        )}
      </Modal>
    )
  },
)

export { ImageDetail }
