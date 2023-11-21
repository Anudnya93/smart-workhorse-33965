import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  Linking
} from 'react-native'
import { Header, PrimaryTextInput, Forms, Button } from '../Common'
import { Fonts, Colors, Images } from '../../res'
import Strings from '../../res/Strings'
import ImagePicker from 'react-native-image-crop-picker'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createEmployee, updateEmployee } from '../../api/business'
import moment from 'moment'
import AppContext from '../../Utils/Context'
import { useContext } from 'react'
import { useEffect } from 'react'
import PhoneInput from 'react-native-phone-input'
import { useRef } from 'react'
import { Icon } from 'react-native-elements'
import countryList from '../../constants/countries'
import { TextInput } from 'react-native-gesture-handler'
import CustomPhoneInput from '../Common/CustomPhoneInput'
import ConfirmPopUp from '../Common/ConfirmPopUp'

const regexDecimalCheck = /^\d+(\.\d{0,2})?$/
const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const MandatoryFields = [
  'first_name',
  'last_name',
  'date_of_birth',
  'mobile',
  'email',
  'address_line_one',
  'city',
  'selectedState'
]

export default function AddEmployeeScene({ navigation, route }) {
  const item = route?.params?.item
  const { _getCountries, states, cities, loadingCity, _getCities } =
    useContext(AppContext)
  const phoneRef = useRef(null)
  const mobileRef = useRef(null)
  // State
  const [state, setState] = useState({
    name: '',
    pay_frequency: '',
    first_name: item?.personal_information?.first_name || '',
    last_name: item?.personal_information?.last_name || '',
    phone: item?.contact?.phone || '',
    mobile: item?.contact?.mobile || '',
    email: item?.contact?.email || '',
    date_of_birth: item?.personal_information?.date_of_birth || '',
    address_line_one: item?.address_information?.address_line_one || '',
    address_line_two: item?.address_information?.address_line_two || '',
    city: item?.address_information?.city || '',
    city_name: item?.address_information?.city_name || '',
    selectedState: item?.address_information?.state || '',
    state_name: item?.address_information?.state_name || '',
    country: '',
    zipcode: '',
    photo: '',
    profile_image: item?.personal_information?.profile_image || '',
    position: item?.work_information?.position || '',
    price: item?.work_information?.hourly_rate?.toString() || '',
    gender: item?.personal_information?.gender || '',
    loading: false,
    validNumber: false,
    validNumber1: false,
    cityText: '',
    openCity: false
  })
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(false)
  const popUpRef = useRef({})

  useEffect(() => {
    _getCountries()
  }, [])

  const {
    loading,
    first_name,
    last_name,
    phone,
    mobile,
    date_of_birth,
    address_line_one,
    address_line_two,
    selectedState,
    city,
    profile_image,
    photo,
    price,
    gender,
    email,
    position,
    validNumber,
    validNumber1,
    cityText,
    openCity,
    city_name,
    state_name
  } = state

  const handleChange = (name, value) => {
    if (name === 'phone' || name === 'mobile') {
      setState(pre => ({
        ...pre,
        validNumber: phoneRef?.current?.isValidNumber(),
        validNumber1: mobileRef?.current?.isValidNumber()
      }))
    }
    if (name === 'email') {
    }
    if (name == 'price') {
      if (regexDecimalCheck.test(value) || value === '') {
        setState(pre => ({ ...pre, [name]: value }))
      }
      return
    }
    setState(pre => ({ ...pre, [name]: value }))
    console.log('setting errors')
    setErrors({ ...errors, [name]: false })
  }

  useEffect(() => {
    if (item) {
      handleChange('validNumber', phoneRef?.current?.isValidNumber())
      handleChange('validNumber1', mobileRef?.current?.isValidNumber())
    }
  }, [item])

  const hideModal = () => {
    handleChange('openCity', false)
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

  const handleSubmit = async () => {
    const disabled =
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !email ||
      !mobile ||
      !address_line_one ||
      !city ||
      !selectedState

    try {
      const emailCheck = email && emailRegex.test(email)

      const phoneCheck = mobile?.startsWith('+91')
        ? mobile?.length == 16
        : mobile?.length == 15

      if (disabled || !emailCheck || !phoneCheck) {
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
          date_of_birth: moment(date_of_birth).format('YYYY-MM-DD'),
          gender
        },
        contact: {
          email,
          mobile,
          phone
        },
        address_information: {
          address_line_one,
          address_line_two,
          city: city,
          state: selectedState
        },
        work_information: {
          position: position || 'Cleaner',
          hourly_rate: price ? Number(price) : 0
        }
      }
      photo && (formData.personal_information.profile_image = photo)
      // console.warn('formData', formData)
      if (item) {
        await updateEmployee(item?.id, formData, token)
        Toast.show('Employee has been updated!')
      } else {
        await createEmployee(formData, token)
        Toast.show('Employee has been added!')
      }
      handleChange('loading', false)
      navigation.navigate('home')
    } catch (error) {
      handleChange('loading', false)
      console.warn('err', error?.response?.data)
      const showWError = error?.response?.data
      if (showWError?.error && showWError?.error?.[0]?.includes('remain')) {
        popUpRef.current = {
          title: 'Limit Reached!',
          desc: 'Looks like your business is growing! You\nhave maxed out the number of employees\nfor your current subscription, please click\nthe button below to adjust your plan in\norder to add more employees, congrats on\nyour success.',
          confirmText: 'Upgrade Subscription'
        }
        setVisible(true)
      } else if (
        showWError?.error &&
        showWError?.error?.includes('not active')
      ) {
        popUpRef.current = {
          title: 'Not Subscribed!',
          desc: 'In order to add employees,\nyou need to subscribe first.',
          confirmText: 'Subscribe'
        }
        setVisible(true)
      } else {
        Toast.show(`Error: ${showWError.error}`)
      }
    }
  }

  const getCityTValue = value => {
    const filtered = cities?.filter(e => e.name === value)
    return filtered.length > 0 ? filtered[0].id : ''
  }

  const getStateValue = value => {
    const filtered = states?.filter(e => e.name === value || e.id === value)
    return filtered?.length > 0 ? filtered[0].id : ''
  }

  const renderPersonalInfoInput = () => {
    return Forms.fields('employeePersonalInfo')?.map(fields => {
      return (
        <PrimaryTextInput
          {...fields}
          text={state[fields.key]}
          // ref={o => (this[fields.key] = o)}
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

  const renderWorkInfo = () => {
    return Forms?.fields('employeeWorkInfo')?.map(fields => {
      return fields.key == 'price' ? (
        <TextInput
          style={{
            height: 50,
            width: '90%',
            paddingTop: Platform.OS === 'android' ? 15 : 0,
            borderRadius: 10,
            color: Colors.TEXT_INPUT_COLOR,
            paddingHorizontal: 15,
            ...Fonts.poppinsRegular(14),
            borderWidth: 1,
            backgroundColor: Colors.TEXT_INPUT_BG,
            borderColor: Colors.TEXT_INPUT_BORDER,
            alignSelf: 'center'
          }}
          value={state[fields.key]}
          onChangeText={(text, isValid) => handleChange(fields.key, text)}
          key={fields.key}
          placeholder={fields.placeholder}
          keyboardType="number-pad"
        />
      ) : (
        <PrimaryTextInput
          {...fields}
          text={state[fields.key]}
          // ref={o => (this[fields.key] = o)}
          key={fields.key}
          onChangeText={(text, isValid) => handleChange(fields.key, text)}
        />
      )
    })
  }

  const renderEmployeeContactInput = () => {
    return Forms?.fields('employeeContact')?.map(fields => {
      if (fields.key === 'mobile' || fields.key === 'phone') {
        return (
          <CustomPhoneInput
            viewStyle={[
              fields.key == 'phone' ? { marginTop: 8 } : {},
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
              setState(pre => {
                const val = { ...pre }
                if (fields.key == 'phone') {
                  val.validNumber = false
                } else if (fields.key == 'mobile') {
                  val.validNumber1 = false
                }
                return val
              })
            }}
            handleValid={() => {
              setState(pre => {
                const val = { ...pre }
                if (fields.key == 'phone') {
                  val.validNumber = true
                } else if (fields.key == 'mobile') {
                  val.validNumber1 = true
                }
                return val
              })
            }}
          />
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            text={state[fields.key]}
            // ref={o => (this[fields.key] = o)}
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

  const getDropdownItem = list => {
    const newList = []
    list?.forEach(element => {
      newList.push({ label: element?.name, value: element?.name })
    })
    return newList
  }

  const getStateText = (list, value) => {
    const filtered = list?.filter(e => e?.name === value || e?.id === value)
    return filtered?.length > 0 ? filtered[0]?.name : ''
  }

  const renderAddressInfo = () => {
    return Forms?.fields('employeeAddress')?.map(fields => {
      if (fields.key === 'city') {
        return (
          <TouchableOpacity
            onPress={() => handleChange('openCity', true)}
            style={[
              {
                height: 50,
                width: '90%',
                paddingTop: 0,
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
              },
              errors[fields.key] && styles.errorBorder
            ]}
          >
            <Text
              style={{
                ...Fonts.poppinsRegular(14),
                color: city_name ? Colors.BLACK : Colors.BLUR_TEXT
              }}
            >
              {city_name ||
                'City' + (MandatoryFields.includes(fields.key) ? '*' : '')}
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
            style={[
              {
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
              },
              errors.selectedState && styles.errorBorder
            ]}
          >
            <Text
              style={{
                ...Fonts.poppinsRegular(14),
                color: state_name ? Colors.BLACK : Colors.BLUR_TEXT
              }}
            >
              {state_name ||
                'State' +
                  (MandatoryFields.includes('selectedState') ? '*' : '')}
            </Text>
          </View>
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            text={state[fields.key]}
            // ref={o => (this[fields.key] = o)}
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
        title={item ? Strings.update : Strings.submit}
        style={styles.footerButton}
        loading={loading}
        onPress={handleSubmit}
      />
    )
  }

  const renderContent = () => {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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
          {renderPersonalInfoInput()}
          <Text style={styles.title}>{Strings.contact}</Text>
          {renderEmployeeContactInput()}
          <Text style={styles.title}>{'Employee Address'}</Text>
          {renderAddressInfo()}
          <Text style={styles.title}>{Strings.workInfo}</Text>
          {renderWorkInfo()}
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
          leftButton
          onLeftPress={() => navigation.goBack()}
          title={item ? Strings.updateEmployee : Strings.addEmployee}
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
                  _getCities(`?search=${text}`)
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
                      handleChange('selectedState', item?.region?.id)
                      handleChange('state_name', item?.region?.name)
                      setErrors(p => ({
                        ...p,
                        city: false,
                        selectedState: false
                      }))
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
      <ConfirmPopUp
        visible={visible}
        setVisible={setVisible}
        desc={popUpRef.current.desc}
        title={popUpRef.current.title}
        confirmText={popUpRef.current.confirmText}
        confirmHandler={() => {
          Linking.openURL('https://www.cleanr.pro')
        }}
        cancelHandler={() => {
          navigation.goBack()
        }}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR,
    margin: 20
  },
  childContainer: {
    flex: 1
  },
  footerButton: {
    marginVertical: '5%'
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
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
  }
})
