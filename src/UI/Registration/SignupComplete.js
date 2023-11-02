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
import { Fonts, Colors, Images } from '../../res'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../Utils/Context'
import { signupUser } from '../../api/auth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { Icon } from 'react-native-elements'

const screenWidth = Dimensions.get('window').width

export default class SignupComplete extends BaseScene {
  static contextType = AppContext
  constructor(props) {
    super(props)
    this.state = {
      termsConditions: true,
      loading: false,
      employee_types: ''
    }
    this.setForms()
  }

  setForms(field) {
    this.forms = Forms.fields('login')
  }

  handleSignup = async () => {
    try {
      const { setUser } = this.context
      this.handleChange('loading', true, true)
      const values = this.props.route?.params?.values
      const payload = {
        ...values,
        employee_types: this.state.employee_types || 'Cleaner',
        is_read_terms: this.state.termsConditions
      }
      const res = await signupUser(payload)
      this.handleChange('loading', false, true)
      // await AsyncStorage.setItem('token', res?.data?.response?.token)
      // if (res?.data?.user) {
      //   setUser(res?.data?.user)
      //   await AsyncStorage.setItem('user', res?.data?.user)
      // }
      this.props.navigation.navigate('VerifyAccount', {
        email: values?.email,
        userData: payload
      })
      Toast.show('Signed up Successfully, Please verify your account!')
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
            this.handleChange('employee_types', text, isValid)
          }
          ref={o => (this.password = o)}
          label={'e.g. Cleaners, Janitors, Crew, Gang, Team...'}
          style={{ width: screenWidth }}
        />
      </View>
    )
  }

  renderFooterButton() {
    return (
      <Button
        onPress={this.handleSignup}
        disabled={!this.state.termsConditions}
        loading={this.state.loading}
        title={this.ls('signUp')}
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

  renderTermsView() {
    return (
      <View style={styles.termsContainer}>
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          unfillColor={Colors.WHITE}
          disableBuiltInState
          iconStyle={{
            borderColor: Colors.BLACK,
            borderRadius: 100
          }}
          style={{ marginRight: -20, marginTop: -3 }}
          onPress={() =>
            this.handleChange('termsConditions', !this.state.termsConditions)
          }
          isChecked={this.state.termsConditions}
        />
        {/* <TouchableOpacity
          onPress={() =>
            this.setState({ termsConditions: !this.state.termsConditions })
          }
        >
          <Image {...Images.checkbox} />
        </TouchableOpacity> */}
        <Text style={styles.textStyle}>
          {'I have read '}
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.navigation.navigate('termsPrivacy')}
          >
            {'Terms & Conditions'}
          </Text>
          <Text style={styles.textStyle}>{' and '}</Text>
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.navigation.navigate('privacyPolicy')}
          >
            {'Privacy Policy'}
          </Text>
        </Text>
      </View>
    )
  }

  renderContent() {
    return (
      <KeyboardAwareScrollView
        style={styles.childContainer}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <Text style={styles.title}>How do you refer to your employees?</Text>
        <Text style={styles.description}>Employees will see this term</Text>
        {/* <View style={{ height: '10%' }} /> */}
        {this.renderTextInput()}
        {this.renderTermsView()}
        {this.renderFooterButton()}
        {/* {this.renderCancelButton()} */}
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
    // marginTop: '15%'
  },
  cancelText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BLUR_TEXT,
    marginVertical: 10,
    width: '90%',
    textAlign: 'center'
  },
  termsContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginTop: 20,
    padding: 20
  },
  textStyle: {
    ...Fonts.poppinsRegular(12),
    marginLeft: 8,
    color: Colors.BLACK
  },
  linkStyle: {
    ...Fonts.poppinsRegular(12),
    color: Colors.BUTTON_BG
  }
})
