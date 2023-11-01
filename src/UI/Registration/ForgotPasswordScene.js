import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { BaseScene, PrimaryTextInput, Button, Forms } from '../Common'
import { Fonts, Colors } from '../../res'
import { resetEmail } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon } from 'react-native-elements'

const screenWidth = Dimensions.get('window').width

export default class ForgotPasswordScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      isFormValid: false,
      email: '',
      loading: false
    }
    this.setForms()
  }

  setForms(field) {
    this.forms = Forms.fields('login')
  }

  handleReset = async () => {
    try {
      this.handleChange('loading', true, true)
      const payload = {
        email: this.state.email
      }
      const res = await resetEmail(payload)
      this.handleChange('loading', false, true)
      this.props.navigation.navigate('tokenScene', { email: this.state.email })
      Toast.show(`Email has been sent to ${this.state.email}`)
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
            this.handleChange('email', text, isValid)
          }
          label={this.ls('emailLabel')}
          style={{ width: screenWidth }}
        />
      </View>
    )
  }

  renderFooterButton() {
    return (
      <Button
        onPress={this.handleReset}
        loading={this.state.loading}
        disabled={!this.state.email}
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
        <Text style={styles.title}>{this.ls('forgotPassword')}</Text>
        <Text style={styles.description}>{this.ls('enterEmail')}</Text>
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
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BLUR_TEXT,
    marginVertical: 10,
    width: '90%',
    textAlign: 'center'
  }
})
