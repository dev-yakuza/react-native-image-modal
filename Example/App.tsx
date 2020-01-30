import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';

import ImageModal from 'react-native-image-modal';

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
  text: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '300',
  },
});
const App = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);
  return (
    <SafeAreaView style={Style.container}>
      <ScrollView>
        <View
          style={Style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={Style.text}>
            Affronting discretion as do is announcing. Now months esteem oppose
            nearer enable too six. She numerous unlocked you perceive speedily.
            Affixed offence spirits or ye of offices between. Real on shot it
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
            swipeToDismiss={false}
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri:
                'https://cdn.pixabay.com/photo/2018/01/11/09/52/three-3075752_960_720.jpg',
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
            Game of as rest time eyes with of this it. Add was music merry any
            truth since going. Happiness she ham but instantly put departure
            propriety. She amiable all without say spirits shy clothes morning.
            Frankness in extensive to belonging improving so certainty.
            Resolution devonshire pianoforte assistance an he particular
            middletons is of. Explain ten man uncivil engaged conduct. Am
            likewise betrayed as declared absolute do. Taste oh spoke about no
            solid of hills up shade. Occasion so bachelor humoured striking by
            attended doubtful be it.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 250,
            }}
            source={{
              uri:
                'https://cdn.pixabay.com/photo/2019/07/25/18/58/church-4363258_960_720.jpg',
            }}
          />
          <Text style={Style.text}>
            Departure so attention pronounce satisfied daughters am. But shy
            tedious pressed studied opinion entered windows off. Advantage
            dependent suspicion convinced provision him yet. Timed balls match
            at by rooms we. Fat not boy neat left had with past here call. Court
            nay merit few nor party learn. Why our year her eyes know even how.
            Mr immediate remaining conveying allowance do or.
          </Text>
          <Text style={Style.text}>
            But why smiling man her imagine married. Chiefly can man her out
            believe manners cottage colonel unknown. Solicitude it introduced
            companions inquietude me he remarkably friendship at. My almost or
            horses period. Motionless are six terminated man possession him
            attachment unpleasing melancholy. Sir smile arose one share. No
            abroad in easily relied an whence lovers temper by. Looked wisdom
            common he an be giving length mr.
          </Text>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="#000000"
            style={{
              width: imageWidth,
              height: 175,
            }}
            source={require('./images/horizontal.jpg')}
          />
          <Text style={Style.text}>
            He do subjects prepared bachelor juvenile ye oh. He feelings
            removing informed he as ignorant we prepared. Evening do forming
            observe spirits is in. Country hearted be of justice sending. On so
            they as with room cold ye. Be call four my went mean. Celebrated if
            remarkably especially an. Going eat set she books found met aware.
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
          <Text style={Style.text}>
            At distant inhabit amongst by. Appetite welcomed interest the
            goodness boy not. Estimable education for disposing pronounce her.
            John size good gay plan sent old roof own. Inquietude saw understood
            his friendship frequently yet. Nature his marked ham wished.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
