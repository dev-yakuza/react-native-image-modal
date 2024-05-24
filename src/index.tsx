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

const ImageModal = (props: Props) => {
  const imageRef = createRef<View>();
  const imageOpacity = new Animated.Value(1);

  const {
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
  } = props;

  const [originModal, setOriginModal] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isOpen, setIsOpen] = useState(false);

  const updateOriginModal = (): void => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      let newY = y;
      if (isTranslucent) {
        newY += StatusBar.currentHeight ? StatusBar.currentHeight : 0;
        StatusBar.setHidden(true);
      }
      let newX = x;
      if (isRTL) {
        newX = Dimensions.get('window').width - width - x;
      }
      setOriginModal({
        width,
        height,
        x: newX,
        y: newY,
      });
    });
  };

  Dimensions.addEventListener('change', updateOriginModal);

  const handleOpen = (): void => {
    if (disabled) return;

    onOpen?.();
    updateOriginModal();
    setTimeout(() => {
      setIsOpen(true);
    });

    imageOpacity.setValue(0);
  };

  const handleClose = (): void => {
    imageOpacity.setValue(1);

    setTimeout(() => {
      setIsOpen(false);

      onClose?.();
    });
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
          activeOpacity={1}
          style={{ alignSelf: 'baseline' }}
          onPress={handleOpen}
          onLongPress={onLongPressOriginImage}
        >
          {typeof renderImageComponent === 'function' ? (
            renderImageComponent(props)
          ) : (
            <Image source={source} style={style} resizeMode={resizeMode} />
          )}
        </TouchableOpacity>
      </Animated.View>
      {isOpen && (
        <ImageDetail
          source={source}
          resizeMode={modalImageResizeMode ?? resizeMode}
          imageStyle={modalImageStyle}
          ref={modalRef}
          isOpen={isOpen}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          isTranslucent={isTranslucent}
          origin={originModal}
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
