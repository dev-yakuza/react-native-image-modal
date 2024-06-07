import {useState} from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ImageModal from '../../dist';
import React from 'react';
import {style} from '../style';

const SimpleDemo = () => {
  const [imageWidth, setImageWidth] = useState<number>(0);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={style.contentsContainer}
          onLayout={(event: LayoutChangeEvent) => {
            setImageWidth(event.nativeEvent.layout.width);
          }}>
          <Text style={style.heading}>Demo</Text>
          <Text style={style.text}>
            Affronting discretion as do is announcing. Now months esteem oppose
            nearer enable too six. She numerous unlocked you perceive speedily.
            Affixed offense spirits or ye of offices between. Real on shot it
            were four an as. Absolute bachelor rendered six nay you juvenile.
            Vanity entire an chatty to.
          </Text>
          <Text style={style.text}>
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
          <Text style={style.text}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export {SimpleDemo};
