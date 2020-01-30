import React from 'react';
import ImageModal from './dist/index';
import {View} from 'react-native';

interface Props {}
const App = ({}: Props) => {
  // // const imageSource = {
  // //   uri:
  // //     'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
  // // };
  // // const imageSource = {
  // //   uri:
  // //     'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
  // // };
  // const imageSource = require('./images/horizontal.jpg');
  const imageSource = require('./images/vertical.jpg');

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <ImageModal
        swipeToDismiss={true}
        resizeMode="contain"
        imageBackground="#000000"
        style={{
          width: 250,
          height: 250,
        }}
        source={imageSource}
        onLongPressOriginImage={() => console.log('onLongPressOriginImage')}
        onTap={() => console.log('onTap')}
        onDoubleTap={() => console.log('onDoubleTap')}
        onLongPress={() => console.log('onLongPress')}
        onOpen={() => console.log('onOpen')}
        didOpen={() => console.log('didOpen')}
        onMove={() => console.log('onMove')}
        responderRelease={() => console.log('responderRelease')}
        willClose={() => console.log('willClose')}
        onClose={() => console.log('onClose')}
      />
    </View>
  );
};

export default App;
