import React, {useState, useRef} from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  Image,
  ImageProps,
} from 'react-native';

import ImageDetail from '../ImageDetail';

interface Props extends ImageProps {
  swipeToDismiss?: boolean;
  overlayBackgroundColor?: string;
  renderHeader?: (close: () => void) => JSX.Element | Array<JSX.Element>;
  onLongPress?: () => void;
  onOpen?: () => void;
  didOpen?: () => void;
  willClose?: () => void;
  onClose?: () => void;
}
const ImageBox = (props: Props) => {
  const {
    renderHeader,
    swipeToDismiss,
    overlayBackgroundColor,
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
      <ImageDetail
        isOpen={state.isOpen}
        origin={state.origin}
        renderHeader={renderHeader}
        swipeToDismiss={swipeToDismiss}
        backgroundColor={overlayBackgroundColor}
        resizeMode={props.resizeMode}
        source={props.source}
        didOpen={didOpen}
        willClose={willClose}
        onClose={_onClose}
      />
    </View>
  );
};

export default ImageBox;
