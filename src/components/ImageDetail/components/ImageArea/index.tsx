import { useRef } from 'react'
import type { ReactNode, RefObject } from 'react'

import { Animated, Image, PanResponder, StyleSheet, View } from 'react-native'

import {
  getCenterPositionBetweenTouches,
  getDistanceBetweenTouches,
  getDistanceFromLastPosition,
  getImagePositionFromDistanceInScale,
  getMaxPosition,
  getOpacityFromSwipe,
  getPositionFromDistanceInScale,
  getZoomAndPositionFromDoubleTap,
  getZoomFromDistance,
  VISIBLE_OPACITY,
} from './utils'

import type { OnMove, OnTap, RenderImageComponentParams } from '../../../../types'
import type {
  GestureResponderEvent,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  PanResponderGestureState,
  StyleProp,
} from 'react-native'

const INITIAL_SCALE = 1
const LONG_PRESS_TIME = 800
const DOUBLE_CLICK_INTERVAL = 250
const CLICK_DISTANCE = 10
const DRAG_DISMISS_THRESHOLD = 150
const INITIAL_ZOOM_DISTANCE = -1

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
})

interface Props {
  readonly renderToHardwareTextureAndroid: boolean
  readonly windowWidth: number
  readonly windowHeight: number
  readonly source: ImageSourcePropType
  readonly resizeMode?: ImageResizeMode
  readonly imageStyle?: StyleProp<ImageStyle>
  readonly swipeToDismiss: boolean
  readonly isAnimated: RefObject<boolean>
  readonly animationDuration: number
  readonly animatedOpacity: Animated.Value
  readonly animatedScale: Animated.Value
  readonly animatedPosition: Animated.ValueXY
  readonly animatedImagePosition: Animated.ValueXY
  readonly animatedImageWidth: Animated.Value
  readonly animatedImageHeight: Animated.Value
  readonly isModalOpen: boolean
  renderImageComponent?(params: RenderImageComponentParams): ReactNode
  onClose(): void
  onDoubleTap?(): void
  onLongPress?(): void
  responderRelease?(vx?: number, scale?: number): void
  onTap?(eventParams: OnTap): void
  onMove?(position: OnMove): void
}

const ImageArea = ({
  renderToHardwareTextureAndroid,
  windowWidth,
  windowHeight,
  source,
  resizeMode,
  imageStyle,
  swipeToDismiss,
  isAnimated,
  animationDuration,
  animatedOpacity,
  animatedScale,
  animatedPosition,
  animatedImagePosition,
  animatedImageWidth,
  animatedImageHeight,
  isModalOpen,
  renderImageComponent,
  onClose,
  onDoubleTap,
  onLongPress,
  onTap,
  onMove,
  responderRelease,
}: Props) => {
  const _scale = useRef(INITIAL_SCALE)

  const _position = useRef({ x: 0, y: 0 })
  const _lastPosition = useRef({ x: 0, y: 0 })
  const _centerPosition = useRef({ x: 0, y: 0 })
  const _zoomCurrentDistance = useRef(INITIAL_ZOOM_DISTANCE)
  const _zoomLastDistance = useRef(INITIAL_ZOOM_DISTANCE)

  const _lastClickTime = useRef(0)
  const _isDoubleClick = useRef(false)
  const _isLongPress = useRef(false)
  const _singleTapTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const _longPressTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const clearLongPressTimeout = () => {
    if (_longPressTimeout.current) {
      clearTimeout(_longPressTimeout.current)
      _longPressTimeout.current = undefined
    }
  }

  const clearSingleTapTimeout = () => {
    if (_singleTapTimeout.current) {
      clearTimeout(_singleTapTimeout.current)
      _singleTapTimeout.current = undefined
    }
  }

  const moveImageToGesture = (gestureState: PanResponderGestureState) => {
    clearLongPressTimeout()
    const { dx, dy } = gestureState
    const newDistance = getDistanceFromLastPosition(_lastPosition.current, { dx, dy })
    _lastPosition.current = { x: dx, y: dy }

    const scale = _scale.current
    _position.current = getImagePositionFromDistanceInScale(scale, _position.current, newDistance)
    animatedPosition.setValue(_position.current)

    const opacity = getOpacityFromSwipe({
      swipeToDismiss,
      scale,
      dy,
      windowHeight,
    })
    animatedOpacity.setValue(opacity)
  }

  const pinchZoom = (event: GestureResponderEvent) => {
    clearLongPressTimeout()
    // Pinch to zoom
    _zoomCurrentDistance.current = getDistanceBetweenTouches(
      event.nativeEvent.changedTouches[0],
      event.nativeEvent.changedTouches[1],
    )
    if (_zoomLastDistance.current !== INITIAL_ZOOM_DISTANCE) {
      // Update zoom
      const distanceDiff = (_zoomCurrentDistance.current - _zoomLastDistance.current) / 200
      const zoom = getZoomFromDistance(_scale.current, distanceDiff)
      _scale.current = zoom
      animatedScale.setValue(_scale.current)

      // Update image position
      _position.current = getPositionFromDistanceInScale({
        currentPosition: _position.current,
        centerDiff: _centerPosition.current,
        distanceDiff,
        zoom,
      })
      animatedPosition.setValue(_position.current)
    }
    _zoomLastDistance.current = _zoomCurrentDistance.current
  }

  const triggerOnMove = (type: string): void => {
    const { x: positionX, y: positionY } = _position.current
    onMove?.({
      type,
      positionX,
      positionY,
      scale: _scale.current,
      zoomCurrentDistance: _zoomCurrentDistance.current,
    })
  }

  const animateToPosition = (position: { x: number; y: number }) => {
    _position.current = position
    Animated.timing(animatedPosition, {
      toValue: _position.current,
      duration: animationDuration,
      useNativeDriver: false,
    }).start()
  }

  const animateToScale = (scale: number) => {
    _scale.current = scale
    Animated.timing(animatedScale, {
      toValue: _scale.current,
      duration: animationDuration,
      useNativeDriver: false,
    }).start()
  }

  const handlePanResponderReleaseResolve = (changedTouchesCount: number): void => {
    // 1. When image is zoomed out and finger is released,
    // Move image position to the center of the screen.
    if (_scale.current < INITIAL_SCALE) {
      animateToPosition({ x: 0, y: 0 })
      return
    }

    // 2. When image is zoomed in and finger is released,
    // Move image position
    if (_scale.current > INITIAL_SCALE) {
      const position = getMaxPosition(_scale.current, _position.current, {
        width: windowWidth,
        height: windowHeight,
      })
      animateToPosition(position)
      return
    }

    // 3. When image is normal and finger is released with swipe up or down,
    // Close image detail.
    if (
      swipeToDismiss &&
      changedTouchesCount === 1 &&
      Math.abs(_position.current.y) > DRAG_DISMISS_THRESHOLD
    ) {
      onClose()
      return
    }

    // 4. When finger is released in original size of image,
    // image should move to the center of the screen.
    animateToPosition({ x: 0, y: 0 })

    // And background should return to its normal opacity.
    Animated.timing(animatedOpacity, {
      toValue: VISIBLE_OPACITY,
      duration: animationDuration,
      useNativeDriver: false,
    }).start()

    triggerOnMove('onPanResponderRelease')
  }

  // Trigger when finger is pressed
  const handlePanResponderGrant = (event: GestureResponderEvent) => {
    if (isAnimated.current) {
      return
    }
    _lastPosition.current = { x: 0, y: 0 }
    _zoomLastDistance.current = INITIAL_ZOOM_DISTANCE
    _isDoubleClick.current = false
    _isLongPress.current = false

    // Clear single click timeout
    clearSingleTapTimeout()
    // Clear long press timeout
    clearLongPressTimeout()

    _longPressTimeout.current = setTimeout(() => {
      _isLongPress.current = true
      onLongPress?.()
    }, LONG_PRESS_TIME)

    // Calculate center diff for pinch to zoom
    if (event.nativeEvent.changedTouches.length > 1) {
      _centerPosition.current = getCenterPositionBetweenTouches(
        event.nativeEvent.changedTouches[0],
        event.nativeEvent.changedTouches[1],
        { width: windowWidth, height: windowHeight },
      )
    }

    if (event.nativeEvent.changedTouches.length <= 1) {
      // Double tap to zoom
      if (new Date().getTime() - _lastClickTime.current < DOUBLE_CLICK_INTERVAL) {
        _lastClickTime.current = 0
        _isDoubleClick.current = true

        const { scale, position } = getZoomAndPositionFromDoubleTap(
          _scale.current,
          event.nativeEvent.changedTouches[0],
          { width: windowWidth, height: windowHeight },
        )
        animateToPosition(position)
        animateToScale(scale)

        triggerOnMove('centerOn')
        onDoubleTap?.()
      } else {
        _lastClickTime.current = new Date().getTime()
      }
    }
  }

  // Trigger when finger is moving
  const handlePanResponderMove = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    if (_isDoubleClick.current || isAnimated.current) {
      return
    }

    // Single tap to move image
    if (event.nativeEvent.changedTouches.length <= 1) {
      moveImageToGesture(gestureState)
    } else {
      pinchZoom(event)
    }

    triggerOnMove('onPanResponderMove')
  }

  // Trigger when finger is released
  const handlePanResponderRelease = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    clearLongPressTimeout()
    if (_isDoubleClick.current || _isLongPress.current || isAnimated.current) {
      return
    }
    const moveDistance = Math.sqrt(
      gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
    )
    // Single tap
    if (event.nativeEvent.changedTouches.length === 1 && moveDistance < CLICK_DISTANCE) {
      _singleTapTimeout.current = setTimeout(() => {
        onTap?.(event.nativeEvent)
      }, DOUBLE_CLICK_INTERVAL)
    } else {
      // Finger is moved and released
      handlePanResponderReleaseResolve(event.nativeEvent.changedTouches.length)
      responderRelease?.(gestureState.vx, _scale.current)
    }
  }

  const _imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: handlePanResponderGrant,
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: handlePanResponderRelease,
  })

  return (
    <View
      style={{
        overflow: 'hidden',
        flex: 1,
      }}
      {..._imagePanResponder.panHandlers}
    >
      <Animated.View
        style={{
          transform: [
            {
              scale: animatedScale,
            },
            {
              translateX: animatedPosition.x,
            },
            {
              translateY: animatedPosition.y,
            },
          ],
          left: animatedImagePosition.x,
          top: animatedImagePosition.y,
          width: animatedImageWidth,
          height: animatedImageHeight,
        }}
        renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
      >
        {typeof renderImageComponent === 'function' ? (
          renderImageComponent({
            source,
            resizeMode,
            style: [imageStyle, styles.image],
            isModalOpen,
          })
        ) : (
          <Image resizeMode={resizeMode} style={[imageStyle, styles.image]} source={source} />
        )}
      </Animated.View>
    </View>
  )
}

export { ImageArea }
