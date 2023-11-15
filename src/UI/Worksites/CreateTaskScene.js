import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native'
import { Header, PrimaryTextInput, WorksiteForms, Button } from '../Common'
import { Fonts, Colors, Strings } from '../../res'
import ImagePicker from 'react-native-image-crop-picker'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  createTask,
  deleteTask,
  deleteTaskMedia,
  getTask,
  updateTask
} from '../../api/business'

const MandatoryFields = ['name', 'frequency_of_task']

export default function CreateTaskScene({ navigation, route }) {
  const worksiteData = route?.params?.worksiteData
  const task = route?.params?.task
  // State
  const [state, setState] = useState({
    name: '',
    description: '',
    notes: '',
    criticality: '',
    frequency_of_task: '',
    files: null,
    loading: false,
    loadingDelete: false,
    loadingDeleteMedia: false,
    photos: []
  })

  const [errors, setErrors] = useState({})

  const {
    loading,
    name,
    criticality,
    description,
    notes,
    frequency_of_task,
    files,
    photos,
    loadingDeleteMedia,
    loadingDelete,
    task_media
  } = state

  useEffect(() => {
    if (task) {
      _getTask()
    }
  }, [task])

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
    setErrors({ ...errors, [name]: false })
  }

  const _getTask = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await getTask(task?.id, token)
      handleChange('name', res?.data?.name)
      handleChange('description', res?.data?.description)
      handleChange('notes', res?.data?.notes)
      handleChange('criticality', res?.data?.criticality)
      handleChange('frequency_of_task', res?.data?.frequency_of_task)
      handleChange('task_media', res?.data?.task_media)
      handleChange('loading', false)
    } catch (error) {
      handleChange('loading', false)
      // console.warn("err", error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const _deleteTask = async () => {
    try {
      handleChange('loadingDelete', true)
      const token = await AsyncStorage.getItem('token')
      await deleteTask(task?.id, token)
      handleChange('loadingDelete', false)
      navigation.navigate('AllWorksiteScene')
    } catch (error) {
      handleChange('loadingDelete', false)
      // console.warn('err', error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const _deleteTaskMedia = async id => {
    try {
      handleChange('loadingDeleteMedia', true)
      const token = await AsyncStorage.getItem('token')
      await deleteTaskMedia(id, token)
      _getTask()
      handleChange('loadingDeleteMedia', false)
    } catch (error) {
      handleChange('loadingDeleteMedia', false)
      // console.warn('err', error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const handleSubmit = async () => {
    const disabled = !name || !frequency_of_task

    try {
      if (disabled) {
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
        worksite: worksiteData?.id,
        name,
        criticality,
        description,
        notes,
        frequency_of_task
      }
      const obj = {}

      photos.length > 0 &&
        photos.forEach((element, index) => {
          obj['file' + index + 1] = element
        })
      photos.length > 0 && (formData.files = obj)
      if (task) {
        await updateTask(task?.id, formData, token)
      } else {
        await createTask(formData, token)
      }
      handleChange('loading', false)
      navigation.navigate('AllWorksiteScene')
      Toast.show(task ? 'Task has been updated!' : 'Task has been created!')
    } catch (error) {
      handleChange('loading', false)
      // console.warn('err', error?.response?.data)
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
      cropping: true,
      multiple: true,
      includeBase64: true
    })
      .then(async response => {
        if (!response.length) {
          handleChange('uploading', false)
        } else {
          const photos = []
          for (let i = 0; i < response.length; i++) {
            const element = response[i]
            photos.push(element.data)
            handleChange('uploading', false)
          }
          handleChange('photos', photos)
          Toast.show('Media Added')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const renderTaskInfoInput = () => {
    return WorksiteForms.fields('addTask').map(fields => {
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

  const renderFooterButtons = () => {
    return (
      <View style={{ padding: 20 }}>
        <Button
          style={[styles.footerWhiteButton]}
          onPress={task ? _deleteTask : _uploadImage}
          isWhiteBg
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          loading={loadingDelete}
          color={Colors.BUTTON_BG}
          icon={task ? 'delete' : 'upload'}
          title={task ? 'Delete' : Strings.uploadMedia}
        />
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
          style={styles.footerButton}
          loading={loading}
          onPress={handleSubmit}
          title={task ? 'Update' : Strings.create}
        />
      </View>
    )
  }

  const renderContent = () => {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.childContainer}>
          <Text style={styles.title}>
            {worksiteData?.personal_information?.name}
          </Text>
          {renderTaskInfoInput()}
          {task && task_media?.length > 0 && (
            <View style={{ width: '90%', marginLeft: '5%', marginTop: 20 }}>
              <Text style={{ ...Fonts.poppinsMedium(16), color: Colors.BLACK }}>
                Media
              </Text>
              {task_media?.map((media, index) => (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  key={index}
                >
                  <Text
                    style={{
                      ...Fonts.poppinsRegular(14),
                      color: Colors.BUTTON_BG
                    }}
                  >
                    {'Photo number ' + (index + 1)}
                  </Text>
                  <TouchableOpacity
                    disabled={loadingDeleteMedia}
                    onPress={() => _deleteTaskMedia(media?.id)}
                    style={{ opacity: loadingDeleteMedia ? 0.5 : 1 }}
                  >
                    <Image
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                      source={require('../../res/Images/common/delete.png')}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {renderFooterButtons()}
        </View>
      </KeyboardAwareScrollView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View style={styles.container}>
        <Header
          title={task ? 'Update a task' : Strings.createTask}
          onLeftPress={() => navigation.goBack()}
          leftButton
        />
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
  }
})
