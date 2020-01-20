import React, {useState} from 'react';
import {StyleSheet, View, Image, Dimensions} from 'react-native';

const Style = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'flex-start',
  },
});
const App = ({onPress}) => {
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });
  // const image = Image.resolveAssetSource(url)
  Image.getSize(
    'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
    (imageWidth, imageHeight) => {
      const windowSize = Dimensions.get('window');
      let width = 0;
      let height = 0;
      console.log('width: ', width);
      console.log('height: ', height);
      if (imageWidth > imageHeight) {
        width = windowSize.width;
        height = (imageHeight * windowSize.width) / imageWidth;
      } else {
        width = (imageWidth * windowSize.height) / imageHeight;
        height = windowSize.height;
      }
      setImageSize({
        width,
        height,
      });
    },
  );
  return (
    <View style={Style.Container}>
      <Image
        enableHorizontalBounce={true}
        style={{
          width: imageSize.width,
          height: imageSize.height,
        }}
        source={{
          uri:
            'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
        }}
      />
    </View>
  );
};

export default App;
