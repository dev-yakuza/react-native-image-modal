import type { ReactNode, RefObject } from 'react'
import { createRef, forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Animated, View } from 'react-native'

import { ImageDetailComponent, OriginImage } from './components'
import { useOriginImageLayout } from './hooks'

import type { ImageDetail } from './components'
import type { OnMove, OnTap, RenderImageComponentParams } from './types'
import type { ImageResizeMode, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native'

const VISIBLE_OPACITY = 1
const INVISIBLE_OPACITY = 0

interface ReactNativeImageModal {
  readonly isOpen: boolean
  open(): void
  close(): void
}

/**
 * @typedef {object} Props
 * @property {ImageSourcePropType} source - Image source.
 * @property {StyleProp<ImageStyle>} [style] - Style for original image.
 * @property {ImageResizeMode} [resizeMode=contain] - Resize mode for original image.
 * @property {boolean} [isRTL=false] - Support for right-to-left layout.
 * @property {boolean} [renderToHardwareTextureAndroid=true] - (Android only) Use hardware texture for animation.
 * @property {boolean} [isTranslucent=false] - Determines whether image modal should go under the system statusbar.
 * @property {boolean} [swipeToDismiss=true] - Dismiss image modal by swiping up or down.
 * @property {boolean} [imageBackgroundColor=transparent] - Background color for original image.
 * @property {boolean} [overlayBackgroundColor=#000000] - Background color for modal image.
 * @property {boolean} [hideCloseButton=false] - Hide close button.
 * @property {boolean} modalRef - Deprecated: Ref for image modal. Use ref instead.
 * @property {boolean} [disabled=false] - Disable opening image modal.
 * @property {boolean} [modalImageStyle] - Style for modal image.
 * @property {boolean} [modalImageResizeMode=contain] - Resize mode for modal image.
 * @property {boolean} [parentLayout] - Parent component layout of ImageModal to limit displayed image modal area when closing image modal.
 * @property {number} [animationDuration=100] - Duration of animation.
 * @property {(close: () => void) => ReactNode} [renderHeader] - Render custom header component. You can close image modal by calling close function.
 * @property {(close: () => void) => ReactNode} [renderFooter] - Render custom footer component. You can close image modal by calling close function.
 * @property {(params: { source: ImageSourcePropType, style?: StyleProp<ImageStyle>, resizeMode?: ImageResizeMode }) => ReactNode} [renderImageComponent] - Render custom image component like expo-image or react-native-fast-image.
 * @property {() => void} [onLongPressOriginImage] - Callback when long press on original image.
 * @property {(eventParams: OnTap) => void} [onTap] - Callback when tap on modal image.
 * @property {() => void} [onDoubleTap] - Callback when double tap on modal image.
 * @property {() => void} [onLongPress] - Callback when long press on modal image.
 * @property {() => void} [onOpen] - Callback when image modal is opening.
 * @property {() => void} [didOpen] - Callback when image modal is opened.
 * @property {(position: OnMove) => void} [onMove] - Callback when modal image is moving.
 * @property {(vx: number, scale: number) => void} [responderRelease] - Callback when finger(s) is released on modal image.
 * @property {() => void} [willClose] - Callback when image modal is closing.
 * @property {() => void} [onClose] - Callback when image modal is closed.
 */
interface Props {
  /**
   *  Image source.
   */
  readonly source: ImageSourcePropType
  /**
   *  Style for original image.
   */
  readonly style?: StyleProp<ImageStyle>
  /**
   *  Resize mode for original image.
   *  @default 'contain'
   */
  readonly resizeMode?: ImageResizeMode
  /**
   *  Support for right-to-left layout.
   *  @default false
   */
  readonly isRTL?: boolean
  /**
   *  (Android only) Use hardware texture for animation.
   *  @default true
   */
  readonly renderToHardwareTextureAndroid?: boolean
  /**
   *  Determines whether image modal should go under the system statusbar.
   *  @default false
   */
  readonly isTranslucent?: boolean
  /**
   *  Dismiss image modal by swiping up or down.
   *  @default true
   */
  readonly swipeToDismiss?: boolean
  /**
   *  Background color for original image.
   *  @default 'transparent'
   */
  readonly imageBackgroundColor?: string
  /**
   *  Background color for modal image.
   *  @default '#000000'
   */
  readonly overlayBackgroundColor?: string
  /**
   *  Hide close button.
   *  @default false
   */
  readonly hideCloseButton?: boolean
  /**
   * @deprecated This prop is deprecated and will be removed in future releases. Use `ref` instead.
   */
  readonly modalRef?: RefObject<ImageDetail>
  /**
   *  Disable opening image modal.
   *  @default false
   */
  readonly disabled?: boolean
  /**
   *  Style for modal image.
   */
  readonly modalImageStyle?: ImageStyle
  /**
   *  Resize mode for modal image.
   *  @default 'contain'
   */
  readonly modalImageResizeMode?: ImageResizeMode
  /**
   *  Parent component layout of ImageModal to limit displayed image modal area when closing image modal.
   */
  readonly parentLayout?: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  /**
   *  Duration of animation.
   *  @default 100
   */
  readonly animationDuration?: number
  /**
   *  Render custom header component. You can close image modal by calling close function.
   */
  renderHeader?(close: () => void): ReactNode
  /**
   *  Render custom footer component. You can close image modal by calling close function.
   */
  renderFooter?(close: () => void): ReactNode
  /**
   *  Render custom image component like expo-image or react-native-fast-image.
   */
  renderImageComponent?(params: RenderImageComponentParams): ReactNode
  /**
   *  Callback when long press on original image.
   */
  onLongPressOriginImage?(): void
  /**
   *  Callback when tap on modal image.
   */
  onTap?(eventParams: OnTap): void
  /**
   *  Callback when double tap on modal image.
   */
  onDoubleTap?(): void
  /**
   *  Callback when long press on modal image.
   */
  onLongPress?(): void
  /**
   *  Callback when image modal is opening.
   */
  onOpen?(): void
  /**
   *  Callback when image modal is opened.
   */
  didOpen?(): void
  /**
   *  Callback when modal image is moving.
   */
  onMove?(position: OnMove): void
  /**
   *  Callback when finger(s) is released on modal image.
   */
  responderRelease?(vx?: number, scale?: number): void
  /**
   *  Callback when image modal is closing.
   */
  willClose?(): void
  /**
   *  Callback when image modal is closed.
   */
  onClose?(): void
}

/**
 * ImageModal component
 * @param {Props} props - Props of ImageModal component
 * @returns {ReactNode} Image modal component
 */
const ImageModal = forwardRef<ReactNativeImageModal, Props>(function ImageModal(
  {
    source,
    style,
    resizeMode = 'contain',
    isRTL = false,
    renderToHardwareTextureAndroid = true,
    isTranslucent,
    swipeToDismiss = true,
    imageBackgroundColor = 'transparent',
    overlayBackgroundColor,
    hideCloseButton,
    modalRef,
    disabled = false,
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
) {
  const imageRef = createRef<View>()
  const imageDetailRef = modalRef ?? createRef<ImageDetail>()
  // If don't use useRef, animation will not work
  const originImageOpacity = useRef(new Animated.Value(VISIBLE_OPACITY)).current
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { originImageLayout, updateOriginImageLayout } = useOriginImageLayout({
    imageRef,
    isRTL,
  })

  const showModal = (): void => {
    onOpen?.()
    // Before opening modal, updating origin image position is required.
    updateOriginImageLayout()
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
    Animated.timing(originImageOpacity, {
      toValue: INVISIBLE_OPACITY,
      duration: animationDuration,
      useNativeDriver: false,
    }).start()
  }

  const handleClose = (): void => {
    originImageOpacity.setValue(VISIBLE_OPACITY)
    hideModal()
  }

  useImperativeHandle(ref, () => ({
    isOpen: isModalOpen,
    open: handleOpen,
    close() {
      imageDetailRef.current!.close()
    },
  }))

  return (
    <View ref={imageRef} style={[{ alignSelf: 'baseline', backgroundColor: imageBackgroundColor }]}>
      <OriginImage
        source={source}
        resizeMode={resizeMode}
        imageOpacity={originImageOpacity}
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
        disabled={disabled}
        style={style}
        isModalOpen={isModalOpen}
        onDialogOpen={handleOpen}
        onLongPressOriginImage={onLongPressOriginImage}
        renderImageComponent={renderImageComponent}
      />
      {isModalOpen && (
        <ImageDetailComponent
          source={source}
          resizeMode={modalImageResizeMode ?? resizeMode}
          imageStyle={modalImageStyle}
          ref={modalRef ?? imageDetailRef}
          isOpen={isModalOpen}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          isTranslucent={isTranslucent}
          origin={originImageLayout}
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
})

export default ImageModal
export type { ReactNativeImageModal, ImageDetail }
