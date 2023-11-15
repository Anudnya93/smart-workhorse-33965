import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  Linking
} from 'react-native'
import { BaseScene, Button } from '../Common'
import { Fonts, Colors } from '../../res'
import LoginScene from './LoginScene'
import SignUpScene from './SignUpScene'
import { Icon } from 'react-native-elements'

const screenWidth = Dimensions.get('window').width

export default class RegistrationScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      slideValues: ['login', 'signUp'],
      selectedIndex: 0
    }
    this.onSegmentedChange = this.onSegmentedChange.bind(this)
  }

  componentDidMount() {
    console.log(this.state.selectedIndex)
    this.animatedLeftMargin = new Animated.Value(0)
  }

  onSegmentedChange(index) {
    this.setState({ selectedIndex: index })
    this.slidePane(index == 0 ? 'left' : 'right', index)
  }

  slidePane(direction, index) {
    let theLeftMargin
    if (direction === 'right') {
      theLeftMargin = parseInt('-' + screenWidth) * index
      Animated.timing(this.animatedLeftMargin, {
        toValue: theLeftMargin,
        duration: 500
      }).start()
    } else {
      Animated.timing(this.animatedLeftMargin, {
        toValue: 0,
        duration: 500
      }).start()
    }
  }

  renderSlider() {
    const styleContainer = {
      borderBottomColor: Colors.SLIDER_COLOR,
      borderBottomWidth: 4,
      paddingHorizontal: 30,
      marginBottom: -3
    }
    return (
      <View style={styles.sliderContainer}>
        <TouchableOpacity
          style={
            this.state.selectedIndex == 0
              ? styleContainer
              : { paddingHorizontal: 30 }
          }
          onPress={() => this.onSegmentedChange(0)}
        >
          <Text
            style={[
              styles.title,
              { opacity: this.state.selectedIndex != 0 ? 0.5 : 1 }
            ]}
          >
            {this.ls('signIn')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            this.state.selectedIndex == 1
              ? styleContainer
              : { paddingHorizontal: 30 }
          }
          onPress={() => this.onSegmentedChange(1)}
        >
          <Text
            style={[
              styles.title,
              { opacity: this.state.selectedIndex != 1 ? 0.5 : 1 }
            ]}
          >
            {this.ls('signUp')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderContent() {
    return (
      <Animated.View
        style={[
          styles.animatedViewStyle,
          { marginLeft: this.animatedLeftMargin }
        ]}
      >
        <View style={styles.childContainerStyle}>
          <LoginScene
            navigation={this.props.navigation}
            onForgotPwd={() => this.props.navigation.navigate('forgotPwd')}
          />
        </View>
        <View style={styles.childContainerStyle}>
          <SignUpScene
            onSuccessful={() => {
              this.props.navigation.navigate('Home')
              this.setState({ selectedIndex: 2 })
            }}
            navigation={this.props.navigation}
            onPrivacyPress={() =>
              Linking.openURL('https://cleanrnow.com/privacy-policy')
            }
            onTermsPress={() =>
              Linking.openURL('https://cleanrnow.com/terms-and-conditions')
            }
          />
        </View>
      </Animated.View>
    )
  }

  render() {
    return (
      <ImageBackground
        source={this.images('splashBg').source}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View
            style={{
              width: '90%',
              marginLeft: '5%',
              marginTop: -25,
              alignItems: 'flex-start'
            }}
          >
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Icon name="left" type="antdesign" color={Colors.WHITE} />
            </TouchableOpacity>
          </View>
          <Image
            source={this.images('appLogo').source}
            style={{ height: 30, alignSelf: 'center' }}
            resizeMode="contain"
          />
          {this.renderSlider()}
          {this.renderContent()}
        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60
  },
  title: {
    ...Fonts.poppinsRegular(18),
    color: 'white',
    textAlign: 'center',
    marginVertical: 10
  },
  sliderContainer: {
    flexDirection: 'row',
    width: screenWidth,
    justifyContent: 'space-around',
    marginTop: '10%',
    alignItems: 'center'
  },
  touchable: {
    borderBottomColor: Colors.WHITE,
    borderBottomWidth: 2,
    paddingHorizontal: 30
  },
  childContainerStyle: {
    width: screenWidth,
    height: '100%'
  },
  animatedViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: screenWidth * 2,
    flex: 1,
    marginTop: 2,
    marginLeft: 0
  }
})
