import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image
} from 'react-native'
import { BaseScene, Button } from '../Common'
import { Fonts, Colors } from '../../res'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-simple-toast'
import { resetEmail, verifyEmail } from '../../api/auth'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AsyncHelper from '../../Utils/AsyncHelper'
import { Icon } from 'react-native-elements'

export default class TokenScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      loading: false,
      seconds: 60,
      text: '',
      code: 0,
      disabled: true,
      confirmResult: null
    }
  }

  handleVerify = async () => {
    try {
      const env = await AsyncHelper.getEnv()
      const email = this.props.route?.params?.email
      const userData = this.props.route?.params?.userData
      this.handleChange('loading', true)
      const payload = {
        email,
        otp: this.state.code
      }
      const res = await verifyEmail(payload)
      // console.warn("verifyEmail", res?.data)
      this.handleChange('loading', false)
      Toast.show('Your account has been verified!')
      await AsyncStorage.setItem('token', res?.data?.response?.token)
      this.props.navigation.navigate(
        env === 'employee' ? 'EmployeeProfileScene' : 'businessProfileCreation',
        { userData }
      )
      // setUser(res?.data?.user)
      // await AsyncStorage.setItem('token', res?.data?.token)
    } catch (error) {
      this.handleChange('loading', false)
      Toast.show("Error: Invalid OTP!")
    }
  }

  handleChange = (key, value) => {
    this.setState(pre => ({ ...pre, [key]: value }))
  }

  handleResendOTP = async () => {
    try {
      const email = this.props.route?.params?.email
      this.handleChange('loading', true)

      const payload = {
        email
      }
      await resetEmail(payload)
      this.handleChange('loading', false)
      Toast.show(`Email has been sent to ${email}`)
    } catch (error) {
      this.handleChange('loading', false)
      Toast.show(`Error: ${error.message}`)
    }
  }

  renderTextInput() {
    return (
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <OTPInputView
          pinCount={4}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          placeholderTextColor={Colors.BLUR_TEXT}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={otp => {
            this.handleChange('code', otp)
          }}
          style={{
            width: '80%',
            paddingTop: 5,
            height: 70
          }}
        />
      </View>
    )
  }

  renderFooterButton() {
    return (
      <Button
        onPress={() => this.handleVerify()}
        disabled={this.state.code.toString().length < 4}
        title={this.ls('submit')}
        loading={this.state.loading}
        style={styles.footerButton}
      />
    )
  }

  renderResendButton() {
    return (
      <TouchableOpacity
        onPress={this.handleResendOTP}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20
        }}
      >
        <Text style={styles.cancelText}>{this.ls('resendToken')}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ImageBackground
        source={this.images('splashBg').source}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView style={styles.container}>
          <View
            style={{
              width: '90%',
              marginLeft: '5%',
              marginTop: 15,
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
          <View style={styles.childContainer}>
            <Text style={styles.title}>{this.ls('tokenInput')}</Text>
            <Text style={styles.description}>{this.ls('enterCode')}</Text>
            {this.renderTextInput()}
            {this.renderFooterButton()}
            {this.renderResendButton()}
          </View>
        </KeyboardAwareScrollView>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  title: {
    ...Fonts.poppinsRegular(28),
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: '20%'
  },
  underlineStyleBase: {
    width: 50,
    borderRadius: 10,
    height: 70,
    borderWidth: 1,
    color: Colors.BLACK,
    backgroundColor: Colors.TEXT_INPUT_BG,
    ...Fonts.poppinsRegular(18)
  },
  underlineStyleHighLighted: {
    borderColor: Colors.BUTTON_BG
  },
  childContainer: {
    // flex: 1,
    // borderWidth: 2,
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    marginTop: '30%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BLUR_TEXT,
    marginVertical: 10
  },
  footerButton: {
    marginTop: '15%'
  },
  forgotPwdText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG,
    marginRight: 20
  },
  cancelText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG
  },
  textInput: {
    height: 80,
    width: 60,
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    padding: 10,
    ...Fonts.poppinsRegular(24),
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER,
    marginHorizontal: 8,
    paddingHorizontal: 20
  }
})
