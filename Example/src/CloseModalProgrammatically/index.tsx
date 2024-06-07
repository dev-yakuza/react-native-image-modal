import {useRef, useState} from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ImageModal, {ImageDetail} from 'react-native-image-modal';
import React from 'react';
import {style} from '../style';

const CloseModalProgrammatically = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  const element = useRef<ImageDetail>(null);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Close modal programmatically</Text>
          <Text style={style.text}>
            The modal will be closed after 3 seconds by calling the close method
            programmatically.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            modalRef={element}
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
            onOpen={() => {
              console.log('onOpen');
              setTimeout(() => {
                element.current?.close();
              }, 3000);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {CloseModalProgrammatically};
