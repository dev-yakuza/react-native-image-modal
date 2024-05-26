import React, { LegacyRef, ReactNode, createRef, useState } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  StyleProp,
  ImageStyle,
  ImageResizeMode,
  ImageSourcePropType,
} from 'react-native';

import { OnTap, OnMove } from './types';
import ImageDetail from './ImageDetail';

const VISIBLE_OPACITY = 1;
const INVISIBLE_OPACITY = 0;

interface Props {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  isRTL?: boolean;
  renderToHardwareTextureAndroid?: boolean;
  isTranslucent?: boolean;
  swipeToDismiss?: boolean;
  imageBackgroundColor?: string;
  overlayBackgroundColor?: string;
  hideCloseButton?: boolean;
  modalRef?: LegacyRef<ImageDetail>;
  disabled?: boolean;
  modalImageStyle?: ImageStyle;
  modalImageResizeMode?: ImageResizeMode;
  renderHeader?: (close: () => void) => ReactNode;
  renderFooter?: (close: () => void) => ReactNode;
  renderImageComponent?: (params: {
    source: ImageSourcePropType;
    style?: StyleProp<ImageStyle>;
    resizeMode?: ImageResizeMode;
  }) => ReactNode;
  onLongPressOriginImage?: () => void;
  onTap?: (eventParams: OnTap) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onOpen?: () => void;
  didOpen?: () => void;
  onMove?: (position: OnMove) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
  willClose?: () => void;
  onClose?: () => void;
}

const ImageModal = ({
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
}: Props) => {
  const imageRef = createRef<View>();
  const imageOpacity = new Animated.Value(VISIBLE_OPACITY);

  const [modalInitialPosition, setModalInitialPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getModalPositionX = (x: number, width: number): number => {
    if (isRTL) {
      return Dimensions.get('window').width - width - x;
    }
    return x;
  };
  const getModalPositionY = (y: number): number => {
    if (isTranslucent) {
      StatusBar.setHidden(true);
      return y + (StatusBar.currentHeight ? StatusBar.currentHeight : 0);
    }
    return y;
  };
  const updateModalInitialPosition = (): void => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      setModalInitialPosition({
        width,
        height,
        x: getModalPositionX(x, width),
        y: getModalPositionY(y),
      });
    });
  };
  Dimensions.addEventListener('change', updateModalInitialPosition);

  const showModal = (): void => {
    onOpen?.();
    updateModalInitialPosition();
    setTimeout(() => {
      setIsModalOpen(true);
    });
  };
  const hideModal = (): void => {
    setTimeout(() => {
      setIsModalOpen(false);
      onClose?.();
    });
  };

  const handleOpen = (): void => {
    showModal();
    imageOpacity.setValue(INVISIBLE_OPACITY);
  };

  const handleClose = (): void => {
    imageOpacity.setValue(VISIBLE_OPACITY);
    hideModal();
  };

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
          ref={modalRef}
          isOpen={isModalOpen}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          isTranslucent={isTranslucent}
          origin={modalInitialPosition}
          backgroundColor={overlayBackgroundColor}
          swipeToDismiss={swipeToDismiss}
          hideCloseButton={hideCloseButton}
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
  );
};

export default ImageModal;
export { ImageDetail };
