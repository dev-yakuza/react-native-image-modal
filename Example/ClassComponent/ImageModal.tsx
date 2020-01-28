import React, {useState, useRef} from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  Image,
  ImageProps,
} from 'react-native';

import ImageDetail from './ImageDetail';

interface Props extends ImageProps {
  swipeToDismiss?: boolean;
  overlayBackgroundColor?: string;
  onLongPressOriginImage?: () => void;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  renderFooter?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  onTap?: (eventParams: IOnTap) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onOpen?: () => void;
  didOpen?: () => void;
  onMove?: (position: IOnMove) => void;
  responderRelease?: (vx?: number, scale?: number) => void;
  willClose?: () => void;
  onClose?: () => void;
}
const ImageModal = (props: Props) => {
  const {
    swipeToDismiss,
    overlayBackgroundColor,
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
  const _root = useRef(null);
  const [state, setState] = useState({
    isOpen: false,
    origin: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  });

  const [originImageOpacity] = useState<Animated.Value>(new Animated.Value(1));

  const open = () => {
    (_root!.current as any).measure(
      (
        ox: number,
        oy: number,
        width: number,
        height: number,
        px: number,
        py: number,
      ) => {
        if (typeof onOpen === 'function') {
          onOpen();
        }

        setState({
          ...state,
          isOpen: true,
          origin: {
            width,
            height,
            x: px,
            y: py,
          },
        });

        _root && originImageOpacity.setValue(0);
        setTimeout(() => {});
      },
    );
  };

  const _onClose = () => {
    originImageOpacity.setValue(1);

    setState({
      ...state,
      isOpen: false,
    });

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <View ref={_root} style={[{alignSelf: 'baseline'}]} onLayout={event => {}}>
      <Animated.View style={{opacity: originImageOpacity}}>
        <TouchableOpacity
          activeOpacity={1}
          style={{alignSelf: 'baseline'}}
          onPress={open}
          onLongPress={onLongPressOriginImage}>
          <Image {...props} />
        </TouchableOpacity>
      </Animated.View>
      <ImageDetail
        isOpen={state.isOpen}
        origin={state.origin}
        source={props.source}
        resizeMode={props.resizeMode}
        backgroundColor={overlayBackgroundColor}
        swipeToDismiss={swipeToDismiss}
        renderHeader={renderHeader}
        renderFooter={renderFooter}
        onTap={onTap}
        onDoubleTap={onDoubleTap}
        onLongPress={onLongPress}
        didOpen={didOpen}
        onMove={onMove}
        responderRelease={responderRelease}
        willClose={willClose}
        onClose={_onClose}
      />
    </View>
  );
};

export default ImageModal;
