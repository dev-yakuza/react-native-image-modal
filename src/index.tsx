import React, { LegacyRef, createRef, useState } from 'react';
import { Animated, View, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import type { ResizeMode } from 'react-native-fast-image';
import type { ImageStyle, FastImageProps } from 'react-native-fast-image';

import { OnTap, OnMove } from './types';
import ImageDetail from './ImageDetail';

interface Props extends FastImageProps {
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
  modalImageResizeMode?: ResizeMode;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  renderFooter?: (close: () => void) => JSX.Element | Array<JSX.Element>;
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

  if (Platform.OS === 'android' && isTranslucent) {
    StatusBar.setTranslucent(isTranslucent);
  }

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
          <FastImage resizeMode={resizeMode} {...props} />
        </TouchableOpacity>
      </Animated.View>
      {isOpen && (
        <ImageDetail
          ref={modalRef}
          isOpen={isOpen}
          renderToHardwareTextureAndroid={renderToHardwareTextureAndroid}
          isTranslucent={isTranslucent}
          origin={originModal}
          source={source}
          resizeMode={modalImageResizeMode ?? resizeMode}
          backgroundColor={overlayBackgroundColor}
          swipeToDismiss={swipeToDismiss}
          hideCloseButton={hideCloseButton}
          imageStyle={modalImageStyle}
          renderHeader={renderHeader}
          renderFooter={renderFooter}
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
