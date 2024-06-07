import {StyleSheet} from 'react-native';

const style = StyleSheet.create({
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

export {style};
