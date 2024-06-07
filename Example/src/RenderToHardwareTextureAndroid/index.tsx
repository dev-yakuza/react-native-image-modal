import {useState} from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ImageModal from 'react-native-image-modal';
import React from 'react';
import {style} from '../style';

const RenderToHardwareTextureAndroid = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>renderToHardwareTextureAndroid</Text>
          <ImageModal
            renderToHardwareTextureAndroid
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {RenderToHardwareTextureAndroid};
