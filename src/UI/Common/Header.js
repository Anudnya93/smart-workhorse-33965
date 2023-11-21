import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions
} from 'react-native'

import { Colors, Images, Fonts } from '../../res'
import FastImage from 'react-native-fast-image'
const { height, width } = Dimensions.get('window')

class Header extends Component {
  renderLeft() {
    const { source, style } = this.props.leftIcon
      ? this.props.leftIcon
      : Images.arrowLeft
    return (
      <TouchableOpacity
        style={[styles.headerCommon, { width: '15%' }]}
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
        onPress={this.props.onLeftPress}
      >
        <Image source={source} style={[style]} />
      </TouchableOpacity>
    )
  }

  isIphoneX() {
    return Platform.OS === 'ios' && (height >= 812 || width >= 812)
  }

  renderRight() {
    return (
      <TouchableOpacity
        style={[styles.headerCommon, { width: '15%' }]}
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
        onPress={this.props.onRightPress}
      >
        {!!this.props.rightIcon && (
          <FastImage
            source={this.props.rightIcon.source}
            style={{ height: 20, width: 20 }}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    )
  }

  renderTitle() {
    return <Text style={styles.titleText}>{this.props.title}</Text>
  }

  render() {
    const { source } = Images.appLogo

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: this.props.transparent
              ? 'transparent'
              : Colors.HEADER_BG
          }
        ]}
      >
        {this.props.leftButton && this.renderLeft()}
        {this.props.title ? (
          this.renderTitle()
        ) : (
          <Image style={[styles.imageLogo, styles.logo]} source={source} />
        )}
        {this.renderRight()}
      </View>
    )
  }
}
const HEADER_HEIGHT = 56

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: Colors.HEADER_BG,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  logo: {
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  titleText: {
    color: Colors.WHITE,
    ...Fonts.poppinsMedium(18),
    alignSelf: 'center',
    width: '70%',
    textAlign: 'center'
  },
  headerCommon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageLogo: {
    height: 300,
    width: 128,
    resizeMode: 'contain'
  }
})

export default Header
