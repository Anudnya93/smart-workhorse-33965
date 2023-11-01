import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { Header, PrimaryTextInput, Forms, Button } from '../Common'
import { Fonts, Colors, Images } from '../../res'
import ImagePicker from 'react-native-image-crop-picker'
import Strings from '../../res/Strings'
import Toast from 'react-native-simple-toast'
import { createAdminProfile } from '../../api/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { useFocusEffect } from '@react-navigation/native'
import AppContext from '../../Utils/Context'
import { useContext } from 'react'
import PhoneInput from 'react-native-phone-input'
import { useRef } from 'react'
import { useEffect } from 'react'
import Autocomplete from 'react-native-autocomplete-input'
import { Icon } from 'react-native-elements'
import countryList from '../../constants/countries'
import CustomPhoneInput from '../Common/CustomPhoneInput'

export default function BusinessProfileScene({ navigation, route }) {
  const {
    _getProfile,
    _getCountries,
    cities,
    states,
    adminProfile,
    loadingCity,
    _getCities
  } = useContext(AppContext)
  const phoneRef = useRef(null)
  const userData = route?.params?.userData
  // State
  // console.warn("userData", userData)
  const [state, setState] = useState({
    name: adminProfile?.business_information?.name || '',
    pay_frequency: adminProfile?.business_information?.pay_frequency || '',
    first_name:
      adminProfile?.personal_information?.first_name ||
      userData?.name?.split(' ')[0] ||
      '',
    last_name:
      adminProfile?.personal_information?.last_name ||
      userData?.name?.split(' ')[1] ||
      '',
    phone: adminProfile?.personal_information?.phone || userData?.phone || '',
    date_of_birth: adminProfile?.personal_information?.date_of_birth || '',
    address_line_one: adminProfile?.business_address?.address_line_one || '',
    address_line_two: adminProfile?.business_address?.address_line_two || '',
    city: adminProfile?.business_address?.city || '',
    city_name: adminProfile?.business_address?.city_name || '',
    selectedState: adminProfile?.business_address?.state || '',
    state_name: adminProfile?.business_address?.state_name || '',
    country: '',
    zipcode: adminProfile?.business_address?.zipcode || '',
    profile_image: adminProfile?.business_information?.profile_image || '',
    photo: null,
    loading: false,
    validNumber: userData?.phone ? true : false,
    cityText: '',
    openCity: false
  })

  const {
    loading,
    name,
    pay_frequency,
    first_name,
    last_name,
    phone,
    date_of_birth,
    address_line_one,
    address_line_two,
    city,
    selectedState,
    country,
    zipcode,
    profile_image,
    photo,
    validNumber,
    cityText,
    openCity,
    state_name,
    city_name
  } = state

  const handleChange = (name, value) => {
    if (name === 'phone') {
      setState(pre => ({
        ...pre,
        validNumber: phoneRef?.current?.isValidNumber()
      }))
    }
    setState(pre => ({ ...pre, [name]: value }))
  }

  useEffect(() => {
    if (adminProfile) {
      handleChange('validNumber', phoneRef?.current?.isValidNumber())
    }
  }, [adminProfile])

  useFocusEffect(
    useCallback(() => {
      _getCountries()
    }, [])
  )

  const getDropdownItem = list => {
    const newList = []
    list?.forEach(element => {
      newList.push({ label: element?.name, value: element?.name })
    })
    return newList
  }
  console.log({ phone })

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
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const formData = {
        business_information: {
          name,
          pay_frequency: pay_frequency || 'Every two weeks'
          // profile_image: photo
        },
        personal_information: {
          first_name,
          last_name,
          phone,
          date_of_birth: moment(date_of_birth).format('YYYY-MM-DD')
          // gender: 'MALE'
        },
        business_address: {
          address_line_one,
          address_line_two,
          city: city,
          state: selectedState,
          zipcode
        }
      }
      photo && (formData.business_information.profile_image = photo)
      // console.warn("formData", formData)
      await createAdminProfile(formData, token)
      _getProfile(token)
      handleChange('loading', false)
      navigation.navigate('AuthLoading')
      Toast.show('Your profile has been updated!')
    } catch (error) {
      handleChange('loading', false)
      if (error.response?.data?.detail) {
        Toast.show(`Error: ${JSON.stringify(error.response?.data?.detail)}`)
      } else {
        const showWError = Object.values(
          error.response?.data?.error || error.response?.data?.detail
        )
        Toast.show(`Error: ${showWError}`)
      }
    }
  }

  const renderTextInput = () => {
    return Forms.fields('businessInfo').map((fields, index) => {
      if (index === 2) {
        return (
          <>
            <Text style={styles.title}>{Strings.personalInfo}</Text>
            <PrimaryTextInput
              {...fields}
              text={state[fields.key]}
              key={fields.key}
              onChangeText={(text, isValid) => handleChange(fields.key, text)}
            />
          </>
        )
      } else if (fields.key === 'phone') {
        return (
          <>
            <CustomPhoneInput
              setter={val => setState(pre => ({ ...pre, phone: val }))}
              placeholder={fields.label}
              val={phone}
              handleInvalid={() => {
                setState(pre => ({ ...pre, validNumber: false }))
              }}
              handleValid={() => {
                setState(pre => ({ ...pre, validNumber: true }))
              }}
            />
          </>
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            text={state[fields.key]}
            key={fields.key}
            onChangeText={(text, isValid) => handleChange(fields.key, text)}
          />
        )
      }
    })
  }

  console.log({ state })

  const getCityValue = value => {
    const filtered = cities?.filter(e => e?.name === value || e?.id === value)
    return filtered?.length > 0 && filtered[0]?.id ? filtered[0]?.id : ''
  }

  const getStateValue = value => {
    const filtered = states?.filter(e => e.name === value || e.id === value)
    return filtered?.length > 0 ? filtered[0].id : ''
  }
  const getStateText = (list, value) => {
    const filtered = list?.filter(e => e?.id === value)
    return filtered?.length > 0 ? filtered[0]?.name : ''
  }

  const renderEmergencyTextInput = () => {
    return Forms.fields('businessAddress').map(fields => {
      if (fields.key === 'city') {
        return (
          <TouchableOpacity
            onPress={() => handleChange('openCity', true)}
            style={{
              height: 50,
              width: '90%',
              paddingTop: 0,
              marginTop: 5,
              borderRadius: 10,
              color: Colors.TEXT_INPUT_COLOR,
              paddingHorizontal: 15,
              borderWidth: 1,
              marginLeft: '5%',
              backgroundColor: Colors.TEXT_INPUT_BG,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderColor: Colors.TEXT_INPUT_BORDER
            }}
          >
            <Text
              style={{
                ...Fonts.poppinsRegular(14),
                color: city_name ? Colors.BLACK : Colors.BLUR_TEXT
              }}
            >
              {city_name || 'City'}
            </Text>
            <Icon
              name="down"
              size={12}
              color={Colors.BLACK}
              style={{ marginLeft: 10 }}
              type="antdesign"
            />
          </TouchableOpacity>
        )
      } else if (fields.key === 'state') {
        return (
          <View
            style={{
              height: 50,
              width: '90%',
              paddingTop: 0,
              borderRadius: 10,
              marginTop: 10,
              paddingHorizontal: 15,
              borderWidth: 1,
              marginLeft: '5%',
              backgroundColor: Colors.TEXT_INPUT_BG,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderColor: Colors.TEXT_INPUT_BORDER
            }}
          >
            <Text
              style={{
                ...Fonts.poppinsRegular(14),
                color: state_name ? Colors.BLACK : Colors.BLUR_TEXT
              }}
            >
              {state_name || 'State'}
            </Text>
          </View>
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            text={state[fields.key]}
            key={fields.key}
            onChangeText={(text, isValid) => handleChange(fields.key, text)}
          />
        )
      }
    })
  }

  const renderFooterButton = () => {
    return (
      <Button
        title={Strings.submit}
        disabled={
          !name ||
          // !pay_frequency ||
          !first_name ||
          !last_name ||
          !phone ||
          !date_of_birth ||
          !address_line_one ||
          // !address_line_two ||
          !city ||
          !selectedState ||
          !zipcode ||
          // !profile_image ||
          !validNumber
        }
        loading={loading}
        style={styles.footerButton}
        onPress={handleProfile}
      />
    )
  }

  const onSubmit = () => {
    navigation.navigate('home')
  }

  const hideModal = () => {
    handleChange('openCity', false)
  }

  const renderContent = () => {
    return (
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        nestedScrollEnabled
        style={{ flex: 1, paddingBottom: 30 }}
      >
        <View style={styles.childContainer}>
          <TouchableOpacity style={styles.imageView} onPress={_uploadImage}>
            {adminProfile?.business_information?.profile_image ||
            profile_image ? (
              <Image
                source={{
                  uri: photo
                    ? profile_image
                    : adminProfile?.business_information?.profile_image ||
                      profile_image
                }}
                style={{ width: '100%', height: '100%', borderRadius: 10 }}
              />
            ) : (
              <>
                <Image {...Images.camera} />
                <Text style={styles.uploadText}>{Strings.uploadPhoto}</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.title}>{Strings.businessInfo}</Text>
          {renderTextInput()}
          <Text style={styles.title}>{Strings.addressInfo}</Text>
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
          title={adminProfile ? 'Update Profile' : 'Create Profile'}
          leftButton
        />
        {renderContent()}
      </View>
      <Modal
        visible={openCity}
        transparent
        onDismiss={hideModal}
        onRequestClose={hideModal}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={hideModal}>
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <View style={{ width: '110%', marginLeft: '-5%' }}>
              <PrimaryTextInput
                text={cityText}
                key="cityText"
                label="Enter city name"
                onChangeText={(text, isValid) => {
                  _getCities(`?search=${cityText}`)
                  handleChange('cityText', text)
                }}
              />
            </View>
            {loadingCity && (
              <ActivityIndicator color={Colors.BACKGROUND_BG} size={'small'} />
            )}
            <FlatList
              data={cities}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      handleChange('openCity', false)
                      handleChange('cityText', '')
                      handleChange('city', item?.id)
                      handleChange('city_name', item?.name)
                      handleChange('state_name', item?.region?.name)
                      handleChange('selectedState', item?.region?.id)
                    }}
                    key={index}
                    style={{
                      width: '100%',
                      height: 30,
                      justifyContent: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.TEXT_INPUT_BORDER
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.poppinsRegular(14),
                        color: Colors.BLACK
                      }}
                    >
                      {item?.name}
                    </Text>
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        </View>
      </Modal>
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
  centerMode: {
    backgroundColor: Colors.MODAL_BG,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 20,
    width: '90%'
  }
})
