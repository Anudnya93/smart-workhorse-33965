import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native'
import { Header, PrimaryTextInput, Forms, Button } from '../Common'
import { Fonts, Colors, Images } from '../../res'
import ImagePicker from 'react-native-image-crop-picker'
import Strings from '../../res/Strings'
import Toast from 'react-native-simple-toast'
import { createAdminProfile, updateAdminProfile } from '../../api/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { useFocusEffect } from '@react-navigation/native'
import AppContext from '../../Utils/Context'
import { useContext } from 'react'
import PhoneInput from 'react-native-phone-input'
import countryList from '../../constants/countries'
import CustomPhoneInput from '../Common/CustomPhoneInput'

const MandatoryFields = [
  'first_name',
  'last_name',
  'date_of_birth',
  'gender',
  'first_name1',
  'last_name1',
  'phone1'
]

export default function EmployeeProfileScene({ navigation, route }) {
  const { _getProfile, adminProfile } = useContext(AppContext)
  const userData = route?.params?.userData
  const phoneRef = useRef(null)
  // State
  const [state, setState] = useState({
    first_name:
      adminProfile?.personal_information?.first_name ||
      userData?.first_name ||
      '',
    last_name:
      adminProfile?.personal_information?.last_name ||
      userData?.last_name ||
      '',
    phone: adminProfile?.personal_information?.phone || '',
    date_of_birth: adminProfile?.personal_information?.date_of_birth || '',
    profile_image: adminProfile?.personal_information?.profile_image || '',
    gender: adminProfile?.personal_information?.gender || '',
    first_name1: adminProfile?.emergency_contact?.first_name || '',
    last_name1: adminProfile?.emergency_contact?.last_name || '',
    phone1: adminProfile?.emergency_contact?.phone || userData?.phone || '',
    photo: null,
    validNumber: userData?.phone ? true : false,
    loading: false
  })
  const [errors, setErrors] = useState({})

  const {
    loading,
    first_name,
    last_name,
    phone,
    gender,
    first_name1,
    last_name1,
    phone1,
    date_of_birth,
    profile_image,
    photo,
    validNumber
  } = state

  const handleChange = (name, value) => {
    if (name === 'phone1') {
      setState(pre => ({
        ...pre,
        validNumber: phoneRef?.current?.isValidNumber()
      }))
    }
    setState(pre => ({ ...pre, [name]: value }))
    setErrors({ ...errors, [name]: false })
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
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false)
        } else {
          const uri = response.path
          const uploadUri =
            Platform.OS === 'ios' ? uri.replace('file://', '') : uri
          const photo = {
            uri: uploadUri,
            name: 'userimage1.png',
            type: response.mime
          }
          handleChange('profile_image', uploadUri)
          handleChange('photo', response.data)
          handleChange('uploading', false)
          Toast.show('Profile Add Successfully')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const handleProfile = async () => {
    const disabled =
      !first_name1 ||
      !last_name1 ||
      !phone1 ||
      !gender ||
      !first_name ||
      !last_name ||
      !date_of_birth
    try {
      const phoneCheck = phone1?.startsWith('+91')
        ? phone1?.length == 16
        : phone1?.length == 15

      if (disabled || !phoneCheck) {
        const newErrors = {}
        MandatoryFields.forEach(field => {
          if (!state[field]) {
            newErrors[field] = true
          }
        })
        console.log({ newErrors })
        // Highlight mandatory fields with red border if not filled
        setErrors(newErrors)
        Toast.show('Please fill mandatory fields properly to continue')
        return
      }
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const formData = {
        personal_information: {
          // profile_image: photo,
          first_name,
          last_name,
          phone,
          date_of_birth: moment(date_of_birth).format('YYYY-MM-DD'),
          gender
        },
        emergency_contact: {
          first_name: first_name1,
          last_name: last_name1,
          phone: phone1
        }
      }
      photo && (formData.personal_information.profile_image = photo)
      await createAdminProfile(formData, token)
      _getProfile(token)
      handleChange('loading', false)
      navigation.navigate('homeEmployee')
      Toast.show('Your profile has been updated!')
    } catch (error) {
      handleChange('loading', false)
      const showWError = Object.values(error.response?.data?.error)
      Toast.show(`Error: ${showWError[0]}`)
    }
  }

  const renderPersonalTextInput = () => {
    return Forms.fields('employeePersonalInfo').map(fields => {
      return (
        <PrimaryTextInput
          {...fields}
          text={state[fields.key]}
          key={fields.key}
          onChangeText={(text, isValid) => handleChange(fields.key, text)}
          label={
            MandatoryFields.includes(fields.key)
              ? fields.label + '*'
              : fields.label
          }
          inputStyle={[errors[fields.key] && styles.errorBorder]}
        />
      )
    })
  }

  const renderEmergencyTextInput = () => {
    return Forms.fields('emergencyContact').map(fields => {
      if (fields.key === 'phone1') {
        return (
          <CustomPhoneInput
            viewStyle={[
              {
                marginTop: 10
              },
              errors[fields.key] && styles.errorBorder
            ]}
            setter={val => {
              setState(pre => ({ ...pre, [fields.key]: val }))
              setErrors({ ...errors, [fields.key]: false })
            }}
            placeholder={
              MandatoryFields.includes(fields.key)
                ? fields.label + '*'
                : fields.label
            }
            val={state[fields.key]}
            handleInvalid={() => {
              setState(pre => ({ ...pre, validNumber: false }))
            }}
            handleValid={() => {
              setState(pre => ({ ...pre, validNumber: true }))
            }}
          />
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            text={state[fields.key]}
            key={fields.key}
            onChangeText={(text, isValid) => handleChange(fields.key, text)}
            label={
              MandatoryFields.includes(fields.key)
                ? fields.label + '*'
                : fields.label
            }
            inputStyle={[errors[fields.key] && styles.errorBorder]}
          />
        )
      }
    })
  }

  const renderFooterButton = () => {
    return (
      <Button
        title={Strings.submit}
        loading={loading}
        style={styles.footerButton}
        onPress={handleProfile}
      />
    )
  }

  const renderContent = () => {
    return (
      <ScrollView style={{ flex: 1, paddingBottom: 30 }}>
        <View style={styles.childContainer}>
          <TouchableOpacity style={styles.imageView} onPress={_uploadImage}>
            {profile_image ? (
              <Image
                source={{ uri: profile_image }}
                style={{ width: '100%', height: '100%', borderRadius: 10 }}
              />
            ) : (
              <>
                <Image {...Images.camera} />
                <Text style={styles.uploadText}>{Strings.uploadPhoto}</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.title}>{Strings.personalInfo}</Text>
          {renderPersonalTextInput()}
          <Text style={styles.title}>{Strings.emergencyContact}</Text>
          {renderEmergencyTextInput()}
          {renderFooterButton()}
        </View>
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View style={styles.container}>
        <Header
          onLeftPress={() => navigation.goBack()}
          title={
            adminProfile?.emergency_contact?.first_name
              ? 'Update Profile'
              : 'Create Profile'
          }
          leftButton
        />
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsRegular(22),
    color: Colors.TEXT_COLOR,
    margin: 20
  },
  childContainer: {
    flex: 1
  },
  footerButton: {
    marginTop: '5%',
    marginBottom: 20
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 24
  },
  uploadText: {
    ...Fonts.poppinsRegular(10),
    alignSelf: 'center',
    color: Colors.GREEN_COLOR,
    marginTop: 5
  },
  imageView: {
    width: 102,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    backgroundColor: Colors.DARK_GREY,
    borderRadius: 10,
    alignSelf: 'center'
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
  }
})
