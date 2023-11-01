import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { BaseScene, PrimaryTextInput, Button, Forms, Header } from '../Common'
import { Fonts, Colors } from '../../res'
import { setPassword } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon } from 'react-native-elements'

const screenWidth = Dimensions.get('window').width

export default class ResetPasswordScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      isFormValid: false,
      loading: false,
      new_password1: '',
      new_password2: ''
    }
    this.setForms()
  }

  setForms(field) {
    this.forms = Forms.fields('login')
  }

  handleReset = async () => {
    try {
      const email = this.props.route?.params?.email
      // const otp = this.props.route?.params?.otp
      this.handleChange('loading', true, true)
      const payload = {
        email,
        // otp,
        new_password1: this.state.new_password1,
        new_password2: this.state.new_password2
      }
      await setPassword(payload)
      this.handleChange('loading', false, true)
      this.props.navigation.navigate('registration')
      Toast.show("Password has been changed")
    } catch (error) {
      // console.warn("error", error)
      this.handleChange('loading', false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  handleChange = (key, value, isValid) => {
    this.setState(pre => ({ ...pre, [key]: value, isFormValid: isValid }))
  }

  renderTextInput() {
    return (
      <View>
        <PrimaryTextInput
          onChangeText={(text, isValid) =>
            this.handleChange('new_password1', text, isValid)
          }
          ref={o => (this.password = o)}
          label="Create New Password"
          style={{ width: screenWidth }}
        />
        <PrimaryTextInput
          onChangeText={(text, isValid) =>
            this.handleChange('new_password2', text, isValid)
          }
          ref={o => (this.confirmPassword = o)}
          label="Confirm New Password"
          correctPassword={this.state.passwordValidation}
          style={{ width: screenWidth }}
        />
      </View>
    )
  }

  renderFooterButton() {
    return (
      <Button
        onPress={() => this.handleReset()}
        loading={this.state.loading}
        disabled={!this.state.new_password1 || !this.state.new_password2}
        title={this.ls('submit')}
        style={styles.footerButton}
      />
    )
  }

  renderCancelButton() {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20
        }}
        onPress={() => this.props.navigation.goBack()}
      >
        <Text style={styles.cancelText}>{this.ls('cancel')}</Text>
      </TouchableOpacity>
    )
  }

  renderContent() {
    return (
      <KeyboardAwareScrollView
        style={styles.childContainer}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <Text style={styles.title}>{this.ls('passwordReset')}</Text>
        {this.renderTextInput()}
        {this.renderFooterButton()}
        {this.renderCancelButton()}
      </KeyboardAwareScrollView>
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
    ...Fonts.poppinsRegular(26),
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: 30
  },
  childContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    marginTop: '20%'
  },
  footerButton: {
    marginTop: '15%'
  },
  cancelText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG
  }
})
