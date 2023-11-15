import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { BaseScene, Button, PrimaryTextInput, Forms, Header } from '../Common'
import { Fonts, Colors } from '../../res'
import { _changePassword } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class ChangePassword extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      oldPassword: '',
      password: '',
      confirmPassword: '',
      isFormValid: false
    }
    this.setForms()
    this.isFormValid = this.isFormValid.bind(this)
  }

  setForms(field) {
    this.forms = Forms.fields('changePassword')
  }

  isFormValid(text, key) {
    this.handleChange(key, text)
    let error = null
    this.forms.map(i => {
      if (!this[i.key].isValid()) {
        error = i.key
        return true
      }
      return false
    })
    if (error) {
      this.setState({ isFormValid: false })
      return false
    }
    this.setState({ isFormValid: true })
    return true
  }

  handleChange = (key, value, isValid) => {
    this.setState(pre => ({ ...pre, [key]: value, isFormValid: isValid }))
  }

  onSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      this.handleChange('loading', true, true)
      const payload = {
        old_password: this.state.oldPassword,
        new_password1: this.state.password,
        new_password2: this.state.confirmPassword
      }
      await _changePassword(payload, token)
      this.handleChange('loading', false, true)
      this.props.navigation.goBack()
      Toast.show('Password has been changed')
    } catch (error) {
      // console.warn('error', error)
      this.handleChange('loading', false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
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

  renderTextInput() {
    return (
      <View>
        <PrimaryTextInput
          ref={o => (this.confirmPassword = o)}
          label="Current Password"
          correctPassword={this.state.passwordValidation}
          onChangeText={text => this.setState({ oldPassword: text })}
          passwordPolicy={true}
          maxLength={40}
          onPasswordValidationCheck={true}
        />
        {this.forms.map(item => {
          return (
            <PrimaryTextInput
              {...item}
              onChangeText={text => this.isFormValid(text, 'password')}
              ref={o => (this[item.key] = o)}
              maxLength={40}
            />
          )
        })}
        <PrimaryTextInput
          onChangeText={text => this.isFormValid(text, 'confirmPassword')}
          ref={o => (this.confirmPassword = o)}
          passwordPolicy={true}
          label="Confirm Password"
          correctPassword={this.state.passwordValidation}
          onPasswordValidationCheck={true}
          maxLength={40}
        />
      </View>
    )
  }

  renderFooterButton() {
    return (
      <Button
        title={this.ls('changePassword')}
        style={styles.footerButton}
        onPress={this.onSubmit}
        loading={this.state.loading}
        disabled={
          !this.state.oldPassword ||
          !this.state.password ||
          this.state.password !== this.state.confirmPassword
        }
      />
    )
  }
  renderHeader() {
    return (
      <Header
        title={this.ls('changePassword')}
        leftButton
        leftIcon={this.images('leftArrow')}
        onLeftPress={() => this.props.navigation.goBack()}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <View style={{ paddingTop: 30 }}>
          {this.renderTextInput()}
          {this.renderFooterButton()}
          {this.renderCancelButton()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsRegular(28),
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: '20%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BLUR_TEXT,
    marginVertical: 10
  },
  footerButton: {
    marginTop: '15%',
    width: '90%'
  },
  forgotPwdText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG,
    marginRight: 20
  },
  cancelText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG
  }
})
