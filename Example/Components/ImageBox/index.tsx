import React, {useState, useRef} from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  ImageResizeMode,
  Image,
  ImageProps,
} from 'react-native';

import ImageDetail from '../ImageDetail';

interface Props extends ImageProps {
  swipeToDismiss?: boolean;
  backgroundColor?: string;
  onLongPress?: () => void;
  onOpen?: () => void;
  willClose?: () => void;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  didOpen?: () => void;
  renderContent: () => JSX.Element | Array<JSX.Element>;
  onClose?: () => void;
}
const ImageBox = (props: Props) => {
  const {
    renderContent,
    renderHeader,
    swipeToDismiss,
    backgroundColor,
    didOpen,
    willClose,
    onOpen,
    onLongPress,
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
    layoutOpacity: new Animated.Value(1),
  });

  const getContent = () => {
    return renderContent();
  };

  const getOverlayProps = () => ({
    isOpen: state.isOpen,
    origin: state.origin,
    renderHeader: renderHeader,
    swipeToDismiss: swipeToDismiss,
    backgroundColor: backgroundColor,
    children: getContent(),
    didOpen: didOpen,
    willClose: willClose,
    onClose: _onClose,
  });

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
        if (onOpen) {
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
        if (didOpen) {
          didOpen();
        }
        setTimeout(() => {
          _root && state.layoutOpacity.setValue(0);
        });
      },
    );
  };

  const _onClose = () => {
    state.layoutOpacity.setValue(1);
    setState({
      ...state,
      isOpen: false,
    });

    if (onClose) {
      onClose();
    }
  };

  return (
    <View ref={_root} style={[{alignSelf: 'baseline'}]} onLayout={event => {}}>
      <Animated.View style={{opacity: state.layoutOpacity}}>
        <TouchableOpacity
          activeOpacity={1}
          style={{alignSelf: 'baseline'}}
          onPress={open}
          onLongPress={onLongPress}>
          <Image {...props} />
        </TouchableOpacity>
      </Animated.View>
      <ImageDetail {...getOverlayProps()} />
    </View>
  );
};

export default ImageBox;
