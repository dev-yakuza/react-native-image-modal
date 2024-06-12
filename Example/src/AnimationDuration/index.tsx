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

const AnimationDuration = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Animation Duration</Text>
          <Text style={style.text}>
            You can set the duration of the animation when the modal is opened
            or closed. The default value is 100 milliseconds.
          </Text>
          <Text style={style.text}>- Normal: 100 milliseconds</Text>
          <ImageModal
            isTranslucent
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={style.text}>- Faster: 50 milliseconds</Text>
          <ImageModal
            isTranslucent
            style={{
              width: imageWidth,
              height: 250,
            }}
            animationDuration={50}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={style.text}>- Slower: 500 milliseconds</Text>
          <ImageModal
            isTranslucent
            style={{
              width: imageWidth,
              height: 250,
            }}
            animationDuration={500}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {AnimationDuration};
