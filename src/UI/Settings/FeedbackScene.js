import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Button, PrimaryTextInput, Header } from '../Common'
import { Fonts, Colors, Images } from '../../res'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ImagePicker from 'react-native-image-crop-picker'
import Strings, { submit } from '../../res/Strings'
import { appFeedback } from '../../api/auth'

export default function FeedbackScene({ navigation }) {
  const [state, setState] = useState({
    email: '',
    message: '',
    file: '',
    loading: false
  })
  const { email, message, file, loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }
  const _uploadImage = async type => {
    handleChange('uploading', true)
    let OpenImagePicker =
      type == 'camera'
        ? ImagePicker.openCamera
        : type == ''
        ? ImagePicker.openPicker
        : ImagePicker.openPicker
    OpenImagePicker({
      cropping: true,
      includeBase64: true
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false)
        } else {
          handleChange('file', response.data)
          handleChange('uploading', false)
          Toast.show('Media Add Successfully')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const onSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      handleChange('loading', true)
      const payload = {
        email,
        message,
        files: { file01: file }
      }
      await appFeedback(payload, token)
      handleChange('loading', false)
      navigation.goBack()
      Toast.show("App feedback submitted")
    } catch (error) {
      // console.warn("error", error)
      handleChange('loading', false)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  function renderCancelButton() {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>{Strings.cancel}</Text>
      </TouchableOpacity>
    )
  }

  function renderTextInput() {
    return (
      <View>
        <PrimaryTextInput
          onChangeText={text => handleChange('email', text)}
          label="Email address"
          value={email}
        />
        <PrimaryTextInput
          onChangeText={text => handleChange('message', text)}
          label="Message"
          value={message}
          inputStyle={{ height: 100 }}
          multiline
        />
      </View>
    )
  }

  function renderUploadButton() {
    return (
      <Button
        style={[styles.footerWhiteButton]}
        isWhiteBg
        iconStyle={{
          width: 20,
          height: 20,
          tintColor: Colors.GREEN_COLOR,
          resizeMode: 'contain'
        }}
        color={Colors.GREEN_COLOR}
        icon={'upload'}
        title={Strings.uploadMedia}
        onPress={_uploadImage}
      />
    )
  }

  function renderFooterButton() {
    return (
      <Button
        title={Strings.submit}
        loading={loading}
        disabled={!email || !message || !file}
        style={styles.footerButton}
        onPress={onSubmit}
      />
    )
  }
  function renderHeader() {
    return (
      <Header
        title={'Send App Feedback'}
        leftButton
        leftIcon={Images.leftArrow}
        onLeftPress={() => navigation.goBack()}
      />
    )
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={{ paddingTop: 30 }}>
        {renderTextInput()}
        {renderUploadButton()}
        {renderFooterButton()}
        {renderCancelButton()}
      </View>
    </View>
  )
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
  },
  footerWhiteButton: {
    marginTop: '5%',
    width: '90%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  }
})
