import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native'
import { Header, PrimaryTextInput, Button } from '../Common'
import { Fonts, Colors, Images } from '../../res'
import Strings from '../../res/Strings'
import WorksiteForms from '../Common/WorksiteForms'
import ImagePicker from 'react-native-image-crop-picker'
import { createWorksite, updateWorksite } from '../../api/business'
import Toast from 'react-native-simple-toast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu'
import { Icon } from 'react-native-elements'

export default function AddWorksiteScene ({ navigation, route }) {
  const worksiteData = route?.params?.worksiteData
  // State
  const [state, setState] = useState({
    name: worksiteData?.personal_information?.name || '',
    location: worksiteData?.personal_information?.location || '',
    description: worksiteData?.personal_information?.description || '',
    notes: worksiteData?.personal_information?.notes || '',
    monthly_rates: worksiteData?.personal_information?.monthly_rates || '',
    clear_frequency_by_day:
      worksiteData?.personal_information?.clear_frequency_by_day || [],
    desired_time: worksiteData?.personal_information?.desired_time || '',
    number_of_workers_needed:
      worksiteData?.personal_information?.number_of_workers_needed?.toString() ||
      '',
    supplies_needed:
      worksiteData?.personal_information?.supplies_needed?.toString() || '',
    contact_person_name:
      worksiteData?.contact_person?.contact_person_name || '',
    contact_phone_number:
      worksiteData?.contact_person?.contact_phone_number || '',
    show_dtails: worksiteData?.show_dtails || false,
    // profile_image: worksiteData?.personal_information?.profile_image || '',
    logo: worksiteData?.logo || null,
    instruction_video: worksiteData?.instruction_video || null,
    loading: false,
    opened: false
  })

  const {
    loading,
    name,
    location,
    description,
    notes,
    monthly_rates,
    clear_frequency_by_day,
    desired_time,
    number_of_workers_needed,
    supplies_needed,
    contact_person_name,
    contact_phone_number,
    show_dtails,
    logo,
    instruction_video,
    opened
  } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const formData = {
        worksite_information: {
          name,
          location,
          description,
          notes,
          monthly_rates,
          clear_frequency_by_day,
          desired_time,
          number_of_workers_needed,
          supplies_needed
        },
        contact_person: {
          contact_person_name,
          contact_phone_number
        },
        show_dtails
      }
      logo && (formData.logo = logo)
      instruction_video && (formData.instruction_video = instruction_video)
      if (worksiteData) {
        await updateWorksite(worksiteData?.id, formData, token)
        Toast.show(`Worksite has been updated!`)
      } else {
        await createWorksite(formData, token)
        Toast.show(`Worksite has been added!`)
      }
      handleChange('loading', false)
      navigation.goBack()
    } catch (error) {
      handleChange('loading', false)
      console.warn('err', error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
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
          handleChange('logo', response.data)
          handleChange('uploading', false)
          Toast.show('Logo Added')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const _uploadVideo = async type => {
    handleChange('uploading', true)
    let OpenImagePicker =
      type == 'camera'
        ? ImagePicker.openCamera
        : type == ''
        ? ImagePicker.openPicker
        : ImagePicker.openPicker
    OpenImagePicker({
      includeBase64: true,
      mediaType: 'video'
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false)
        } else {
          const base64 = await RNFS.readFile(response.path, 'base64')
          handleChange('instruction_video', base64)
          handleChange('uploading', false)
          Toast.show('Video Added')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const renderPersonalInfoInput = () => {
    return WorksiteForms.fields('addWorksite')?.map(fields => {
      if (fields?.key === 'clear_frequency_by_day') {
        return (
          <Menu
            opened={opened}
            style={{ width: '100%' }}
            onBackdropPress={() => handleChange('opened', !opened)}
          >
            <MenuTrigger
              onPress={() => handleChange('opened', !opened)}
              style={{ width: '100%', alignItems: 'center', marginTop: 10 }}
            >
              <View
                style={[
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '90%',
                    height: 50,
                    width: '90%',
                    borderRadius: 10,
                    color: Colors.TEXT_INPUT_COLOR,
                    paddingHorizontal: 15,
                    ...Fonts.poppinsRegular(14),
                    borderWidth: 1,
                    backgroundColor: Colors.TEXT_INPUT_BG,
                    borderColor: Colors.TEXT_INPUT_BORDER,
                    paddingHorizontal: 15,
                    marginBottom: 10
                  }
                ]}
              >
                <Text
                  style={{
                    ...Fonts.poppinsRegular(12),
                    color:
                      clear_frequency_by_day?.length > 0
                        ? Colors.BLACK
                        : Colors.BLUR_TEXT
                  }}
                >
                  {clear_frequency_by_day?.length > 0
                    ? clear_frequency_by_day?.toString()
                    : Strings.cleaningFreq}
                </Text>
                <Icon
                  name='down'
                  size={12}
                  color={Colors.BLUR_TEXT}
                  style={{ marginLeft: 10 }}
                  type='antdesign'
                />
              </View>
            </MenuTrigger>
            <MenuOptions style={{ width: '100%' }}>
              {fields?.items?.map(item => {
                const isSelected = clear_frequency_by_day?.some(
                  e => e === item?.value
                )
                return (
                  <MenuOption
                    style={{ width: '100%' }}
                    onSelect={() => {
                      if (isSelected) {
                        const removed = clear_frequency_by_day?.filter(
                          e => e !== item?.value
                        )
                        handleChange(fields?.key, removed)
                      } else {
                        handleChange(fields?.key, [
                          ...clear_frequency_by_day,
                          item?.value
                        ])
                      }
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10
                      }}
                    >
                      <Text style={{ ...Fonts.poppinsRegular(14) }}>
                        {item?.label}
                      </Text>
                      <Image {...Images[isSelected ? 'checked' : 'checkbox']} />
                    </View>
                  </MenuOption>
                )
              })}
            </MenuOptions>
          </Menu>
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

  const renderEmployeeContactInput = () => {
    return WorksiteForms.fields('worksiteContact')?.map(fields => {
      return (
        <PrimaryTextInput
          {...fields}
          text={state[fields.key]}
          key={fields.key}
          onChangeText={(text, isValid) => handleChange(fields.key, text)}
        />
      )
    })
  }

  const renderFooterButtons = () => {
    return (
      <View style={{ padding: 20 }}>
        <Button
          onPress={_uploadImage}
          style={[styles.footerWhiteButton]}
          isWhiteBg
          icon={'upload'}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          color={Colors.BUTTON_BG}
          title={Strings.uploadWorksiteLogo}
        />
        <Button
          onPress={_uploadVideo}
          style={[styles.footerWhiteButton]}
          isWhiteBg
          icon={'upload'}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          color={Colors.BUTTON_BG}
          title={Strings.uploadVideo}
        />
        {/* <Button
          style={[styles.footerWhiteButton]}
          isWhiteBg
          icon={'add'}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          color={Colors.BUTTON_BG}
          title={Strings.createTask}
        /> */}
        {/* <Button
          style={[styles.footerWhiteButton]}
          title={Strings.edit}
          icon={'edit'}
          isWhiteBg
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          color={Colors.BUTTON_BG}
        /> */}
        <Button
          onPress={handleSubmit}
          disabled={
            !name ||
            !location ||
            !description ||
            !notes ||
            // !monthly_rates ||
            clear_frequency_by_day.length === 0 ||
            !desired_time ||
            !number_of_workers_needed ||
            !supplies_needed ||
            !contact_person_name ||
            !contact_phone_number ||
            !logo
          }
          loading={loading}
          style={styles.footerButton}
          title={worksiteData ? Strings.update : Strings.save}
        />
      </View>
    )
  }

  const renderShowDetails = () => {
    return (
      <View style={styles.termsContainer}>
        <TouchableOpacity
          onPress={() => handleChange('show_dtails', !show_dtails)}
        >
          <Image {...Images[show_dtails ? 'checked' : 'checkbox']} />
        </TouchableOpacity>
        <Text style={styles.textStyle}>{'Show details'}</Text>
      </View>
    )
  }

  const renderContent = () => {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, width: '100%' }}
      >
        <View style={styles.childContainer}>
          {/* <TouchableOpacity style={styles.imageView} onPress={_uploadImage}>
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
          </TouchableOpacity> */}
          <Text style={styles.title}>{'Worksite Information'}</Text>
          {renderPersonalInfoInput()}
          <Text style={styles.title}>{Strings.contactInfo}</Text>
          {renderEmployeeContactInput()}
          {renderShowDetails()}
          {renderFooterButtons()}
        </View>
      </KeyboardAwareScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ width: '100%' }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View style={styles.container}>
        <Header
          title={worksiteData ? Strings.updateWorksite : Strings.addWorksite}
          leftButton
          onLeftPress={() => navigation.goBack()}
        />
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR,
    margin: 20
  },
  childContainer: {
    flex: 1,
    width: '100%'
  },
  footerButton: {
    marginTop: '5%',
    width: '100%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 24
  },
  footerWhiteButton: {
    marginTop: '5%',
    width: '100%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  },
  termsContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 20
  },
  textStyle: {
    ...Fonts.poppinsRegular(12),
    marginLeft: 8,
    color: Colors.BLACK
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
  }
})
