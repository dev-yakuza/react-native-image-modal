import React, {useState, useRef} from 'react';
import ImageModal, {ImageDetail} from './dist';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  ImageRequireSource,
  StyleProp,
} from 'react-native';
import FastImage, {ImageStyle, ResizeMode} from 'react-native-fast-image';

const Style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  contentsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginTop: 8,
    marginHorizontal: 8,
    borderBottomWidth: 1,
  },
  text: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '300',
  },
});
const App = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  const element = useRef<ImageDetail>(null);

  return (
    <SafeAreaView style={Style.container}>
      <ScrollView>
        <View
          style={Style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={Style.heading}>Demo</Text>
          <Text style={Style.text}>
            Affronting discretion as do is announcing. Now months esteem oppose
            nearer enable too six. She numerous unlocked you perceive speedily.
            Affixed offense spirits or ye of offices between. Real on shot it
            were four an as. Absolute bachelor rendered six nay you juvenile.
            Vanity entire an chatty to.
          </Text>
          <Text style={Style.text}>
            Prepared is me marianne pleasure likewise debating. Wonder an unable
            except better stairs do ye admire. His and eat secure sex called
            esteem praise. So moreover as speedily differed branched ignorant.
            Tall are her knew poor now does then. Procured to contempt oh he
            raptures amounted occasion. One boy assure income spirit lovers set.
          </Text>
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
          <Text style={Style.text}>
            Game of as rest time eyes with of this it. Add was music merry any
            truth since going. Happiness she ham but instantly put departure
            propriety. She amiable all without say spirits shy clothes morning.
            Frankness in extensive to belonging improving so certainty.
            Resolution devonshire pianoforte assistance an he particular
            middleton is of. Explain ten man uncivil engaged conduct. Am
            likewise betrayed as declared absolute do. Taste oh spoke about no
            solid of hills up shade. Occasion so bachelor humoured striking by
            attended doubtful be it.
          </Text>
          <Text style={Style.heading}>Event</Text>
          <Text style={Style.text}>You can see the log in the terminal.</Text>
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
          <Text style={Style.text}>
            <Text>
              - onLongPressOriginImage{'\n'}- onTap{'\n'}- onDoubleTap{'\n'}-
              onLongPress{'\n'}- onOpen{'\n'}- didOpen{'\n'}- onMove{'\n'}-
              responderRelease{'\n'}- willClose{'\n'}- onClose
            </Text>
          </Text>
          <Text style={Style.heading}>ResizeMode</Text>
          <Text style={Style.text}>- Container</Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
            }}
          />
          <Text style={Style.text}>- Cover</Text>
          <ImageModal
            resizeMode="cover"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
            }}
          />
          <Text style={Style.text}>- Stretch</Text>
          <ImageModal
            resizeMode="stretch"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
            }}
          />
          <Text style={Style.text}>- Center</Text>
          <ImageModal
            resizeMode="center"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>Translucent status bar</Text>
          <Text style={Style.text}>
            You can set true to isTranslucent to make status bar translucent.
          </Text>
          <ImageModal
            isTranslucent
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 175,
            }}
            source={require('./images/horizontal.jpg')}
          />
          <Text style={Style.heading}>Image background color</Text>
          <Text style={Style.text}>
            You can set imageBackgroundColor to change the background color.
          </Text>
          <Text style={Style.text}>- imageBackgroundColor is not set</Text>
          <ImageModal
            resizeMode="contain"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('./images/vertical.jpg')}
          />
          <Text style={Style.text}>
            - imageBackgroundColor is set to #000000
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('./images/vertical.jpg')}
          />
          <Text style={Style.heading}>Custom close button on Footer</Text>
          <Text style={Style.text}>
            You can set imageBackgroundColor to change the background color.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('./images/vertical.jpg')}
            hideCloseButton
            renderFooter={onClose => (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#FFFFFF',
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>CloseButton</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={Style.heading}>Custom close button on Header</Text>
          <Text style={Style.text}>
            You can set imageBackgroundColor to change the background color.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={require('./images/vertical.jpg')}
            renderHeader={onClose => (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#FFFFFF',
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>CloseButton</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={Style.heading}>Disable swipeToDismiss</Text>
          <Text style={Style.text}>
            You can set false to swipeToDismiss to disable swiping the modal to
            dismiss.
          </Text>
          <ImageModal
            swipeToDismiss={false}
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>Close modal programmatically</Text>
          <Text style={Style.text}>
            You can set false to swipeToDismiss to disable swiping the modal to
            dismiss.
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
          <Text style={Style.heading}>modalImageResizeMode</Text>
          <Text style={Style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "contain"
          </Text>
          <ImageModal
            resizeMode="center"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('./images/small.png')}
          />
          <Text style={Style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "cover"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="cover"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('./images/small.png')}
          />
          <Text style={Style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "stretch"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="stretch"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('./images/small.png')}
          />
          <Text style={Style.text}>
            - resizeMode: "center"{'\n'}- modalImageResizeMode: "center"
          </Text>
          <ImageModal
            resizeMode="center"
            modalImageResizeMode="center"
            imageBackgroundColor="#000000"
            style={{
              width: 40,
              height: 40,
            }}
            source={require('./images/small.png')}
          />
          <Text style={Style.heading}>RTL</Text>
          <ImageModal
            isRTL
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>renderToHardwareTextureAndroid</Text>
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
          <Text style={Style.heading}>overlayBackgroundColor</Text>
          <ImageModal
            overlayBackgroundColor="#FF0000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>disabled</Text>
          <ImageModal
            disabled
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>modalImageStyle</Text>
          <ImageModal
            style={{
              width: imageWidth,
              height: 250,
            }}
            modalImageStyle={{backgroundColor: '#00FF00'}}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
          />
          <Text style={Style.heading}>Use FastImage</Text>
          <ImageModal
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri: 'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
            }}
            renderImageComponent={({source, resizeMode, style}) => (
              <FastImage
                style={style as StyleProp<ImageStyle>}
                source={source as ImageRequireSource}
                resizeMode={resizeMode as ResizeMode}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
