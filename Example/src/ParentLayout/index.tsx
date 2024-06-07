import {useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import ImageModal from 'react-native-image-modal';
import React from 'react';
import FastImage from 'react-native-fast-image';

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 15,
  },
  body: {
    flex: 1,
  },
  imageContainer: {
    width: 100,
    height: 150,
    borderRadius: 25,
    overflow: 'hidden',
    margin: 10,
  },
  footer: {
    padding: 15,
  },
});

const ParentLayout = () => {
  const [parentLayout, setParentLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 35,
      }}>
      <View style={style.header}>
        <Text>parentLayout</Text>
      </View>
      <View style={style.body}>
        <FlatList
          onLayout={event => {
            event.target.measure((x, y, width, height, pageX, pageY) => {
              setParentLayout({
                x: pageX,
                y: pageY,
                width,
                height,
              });
            });
          }}
          data={[1, 2, 3, 4, 5, 6, 7, 8]}
          renderItem={() => {
            return (
              <View style={style.imageContainer}>
                <ImageModal
                  isTranslucent={true}
                  style={{
                    width: 100,
                    height: 150,
                  }}
                  modalImageStyle={{
                    width: 100,
                    height: 150,
                    borderRadius: 25,
                    overflow: 'hidden',
                  }}
                  resizeMode="contain"
                  source={{
                    uri: 'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
                  }}
                  parentLayout={parentLayout}
                  renderImageComponent={({source, resizeMode, style}: any) => (
                    <FastImage
                      style={style}
                      source={source}
                      resizeMode={resizeMode}
                    />
                  )}
                />
              </View>
            );
          }}
        />
      </View>
      <View style={style.footer}>
        <Text>
          Sometimes, you need to show the image in the list like the chat UI.
          The parentLayout props will help you limit the image display area in
          the modal dismiss.
        </Text>
      </View>
    </View>
  );
};

export {ParentLayout};
