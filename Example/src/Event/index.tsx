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

const Event = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Event</Text>
          <Text style={style.text}>You can see the log in the terminal.</Text>
          <ImageModal
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
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
          <Text style={style.text}>
            <Text>
              - onLongPressOriginImage{'\n'}- onTap{'\n'}- onDoubleTap{'\n'}-
              onLongPress{'\n'}- onOpen{'\n'}- didOpen{'\n'}- onMove{'\n'}-
              responderRelease{'\n'}- willClose{'\n'}- onClose
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {Event};
