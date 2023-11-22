import React, { useContext, useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ScrollView
} from 'react-native'
import { Button } from '../Common'
import { Fonts, Colors, Images, Strings } from '../../res'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAttendance, updateUpcomingShiftTimes } from '../../api/employee'
import Toast from 'react-native-simple-toast'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppContext from '../../Utils/Context'
import { Icon } from 'react-native-elements'
import Upset from '../../res/Svgs/Upset.svg'
import Rushed from '../../res/Svgs/Rushed.svg'
import Neutral from '../../res/Svgs/Neutral.svg'
import DatePicker from 'react-native-date-picker'
import Happy from '../../res/Svgs/Happy.svg'
import Confident from '../../res/Svgs/Confident.svg'
import Worried from '../../res/Svgs/Worried.svg'
import ImagePicker from 'react-native-image-crop-picker'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import PrimaryTextInput from '../Common/PrimaryTextInput'
import moment from 'moment-timezone'
import { SvgXml } from 'react-native-svg'
import ClockINOUT from './ClockINOUT'
import { checkError } from '../../../App'

export default function ShiftView() {
  const navigation = useNavigation()
  const {
    _getUpcomingShift,
    upcomingShiftTimesDataList,
    upcomingShiftData,
    user
  } = useContext(AppContext)
  const [state, setState] = useState({
    loading: false,
    visible: false,
    visible1: false,
    completed_tasks: [],
    notes: '',
    feedback: '',
    clock_in_time: '',
    clock_out_time: '',
    urgent: false,
    is_clock_in_time: false,
    is_clock_out_time: false,
    loadingSubmit: false,
    selectedFeeling: '',
    notes_media: '',
    feedback_media: '',
    openStart: false,
    upcomingShiftTimesData: upcomingShiftTimesDataList || [],
    clock_in_time: moment
      .utc(upcomingShiftData?.clock_in_time)
      .local()
      .format('hh:mm A'),
    clock_in_timeDate:
      new Date(moment(upcomingShiftData?.clock_in_time)) || new Date(),
    openEnd: false,
    clock_out_time: moment().format('hh:mm A'),
    clock_out_timeDate: new Date(),
    is_shift_completed: false,
    shiftNeedClose: null
  })

  const {
    completed_tasks,
    visible,
    visible1,
    is_clock_in_time,
    clock_in_time,
    is_clock_out_time,
    clock_out_time,
    openStart,
    openEnd,
    urgent,
    feedback,
    notes,
    loadingSubmit,
    selectedFeeling,
    notes_media,
    feedback_media,
    clock_in_timeDate,
    clock_out_timeDate,
    is_shift_completed,
    upcomingShiftTimesData,
    shiftNeedClose
  } = state
  // console.warn("upcomingShiftData", upcomingShiftData?.status)

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      _getUpcomingShift()
    }, [])
  )

  useEffect(() => {
    if (upcomingShiftTimesDataList?.length > 0) {
      handleChange('upcomingShiftTimesData', upcomingShiftTimesDataList)
    }
  }, [upcomingShiftTimesDataList])
  useEffect(() => {
    if (upcomingShiftTimesData?.length > 0) {
      upcomingShiftTimesData?.forEach(element => {
        if (element?.clock_out_time === null) {
          handleChange('shiftNeedClose', element)
          return
        }
      })
    }
  }, [upcomingShiftTimesData])

  const hideModal = () => {
    handleChange('selectedEvent', null)
    handleChange('visible', false)
    handleChange('visible1', false)
  }

  const _uploadImage = async (type, key) => {
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
          handleChange(key, response.data)
          handleChange('uploading', false)
          Toast.show('Media Add Successfully')
        }
      })
      .catch(err => {
        handleChange('showAlert', false)
        handleChange('uploading', false)
      })
  }

  const _updateUpcomingShiftTimes = async noUpdate => {
    try {
      handleChange('loadingSubmit', true)
      const token = await AsyncStorage.getItem('token')
      const list = []
      upcomingShiftTimesData?.forEach(element => {
        if (element?.clock_out_time === null) {
          list.push({
            ...element,
            clock_out_time: moment
              .utc(moment(new Date()))
              .format('YYYY-MM-DD HH:mm:ss')
          })
        } else {
          list.push(element)
        }
      })
      const payload = {
        event: upcomingShiftData?.id,
        shifts: list
      }
      await updateUpcomingShiftTimes(payload, token)
      if (!noUpdate) {
        const payload1 = {
          event: upcomingShiftData?.id,
          status: 'CLOCK_OUT',
          is_shift_completed: false
        }
        await createAttendance(payload1, token)
      }
      handleChange('shiftNeedClose', null)
      handleChange('loadingSubmit', false)
      handleChange('notes', '')
      handleChange('feedback', '')
      handleChange('clock_in_time', '')
      handleChange('clock_out_time', '')
      handleChange('notes_media', '')
      handleChange('feedback_media', '')
      handleChange('urgent', false)
      handleChange('completed_tasks', [])
      handleChange('visible', false)
      handleChange('visible1', false)
      _getUpcomingShift()
    } catch (error) {
      console.log(JSON.stringify(error.response))
      handleChange('loadingSubmit', false)
      checkError(error)
    }
  }

  const _createAttendance = async () => {
    try {
      handleChange('loadingSubmit', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        event: upcomingShiftData?.id,
        status: 'CLOCK_OUT',
        completed_tasks,
        notes,
        feedback,
        notes_media,
        feedback_media,
        urgent,
        is_shift_completed,
        clock_in_time: moment
          .utc(
            moment(
              new Date(
                moment(
                  upcomingShiftTimesData[upcomingShiftTimesData?.length - 1]
                    ?.clock_in_time || new Date()
                )
              )
            )
          )
          .format('YYYY-MM-DD HH:mm:ss'),
        clock_out_time: moment
          .utc(
            moment(
              new Date(
                moment(
                  upcomingShiftTimesData[upcomingShiftTimesData?.length - 1]
                    ?.clock_out_time || new Date()
                )
              )
            )
          )
          .format('YYYY-MM-DD HH:mm:ss')
      }
      await createAttendance(payload, token)
      _updateUpcomingShiftTimes(true)
      // handleChange("loadingSubmit", false)
      // handleChange("notes", "")
      // handleChange("feedback", "")
      // handleChange("clock_in_time", "")
      // handleChange("clock_out_time", "")
      // handleChange("notes_media", "")
      // handleChange("feedback_media", "")
      // handleChange("urgent", false)
      // handleChange("completed_tasks", [])
      // handleChange("visible", false)
      // handleChange("visible1", false)
      // _getUpcomingShift()
    } catch (error) {
      console.log(JSON.stringify(error.response))
      handleChange('loadingSubmit', false)
      const showWError = Object.values(
        error.response?.data || error.response?.data?.error
      )
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const handleShift = () => {}

  // console.warn('upcomingShiftData',upcomingShiftData?.status);

  const renderClockButton = () => {
    return (
      <Button
        onPress={() => {
          shiftNeedClose?.clock_out_time === null
            ? _updateUpcomingShiftTimes(false)
            : navigation.navigate('ShiftDetails', { upcomingShiftData })
        }}
        loading={loadingSubmit}
        title={
          shiftNeedClose?.clock_out_time === null
            ? 'Clock Out'
            : Strings.clockIn
        }
        backgroundColor={
          shiftNeedClose?.clock_out_time === null
            ? Colors.RED_COLOR
            : Colors.BACKGROUND_BG
        }
        disabled={
          !upcomingShiftData?.status ||
          !moment
            .utc(upcomingShiftData?.schedule_shift_start_time)
            .local()
            .isBefore(new Date())
        }
        style={{
          marginTop: 30
        }}
      />
    )
  }
  const renderClockEndButton = () => {
    return (
      <Button
        onPress={() => {
          handleChange('visible', true)
          handleChange('is_shift_completed', true)
        }}
        title={'Clock Out and End Journey'}
        backgroundColor={Colors.RED_COLOR}
        disabled={
          !upcomingShiftData?.status ||
          !moment
            .utc(upcomingShiftData?.schedule_shift_start_time)
            .local()
            .isBefore(new Date())
        }
        style={{
          marginTop: 10
        }}
      />
    )
  }

  const feelings = [
    { key: 'Confident', icon: Confident },
    { key: 'Happy', icon: Happy },
    { key: 'Neutral', icon: Neutral },
    { key: 'Worried', icon: Worried },
    { key: 'Rushed', icon: Rushed },
    { key: 'Upset', icon: Upset }
  ]

  return (
    <>
      {upcomingShiftData?.status && (
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <View style={{ width: '85%' }}>
              <Text style={styles.title}>
                {upcomingShiftData?.status === 'CLOCK_OUT'
                  ? 'Current Shift'
                  : Strings.upcomingShift}
              </Text>
              <Text style={styles.description}>
                {upcomingShiftData?.worksite?.name}
              </Text>
              <Text
                style={[
                  styles.description,
                  { fontSize: 14, color: Colors.HOME_DES }
                ]}
              >
                Location: {upcomingShiftData?.worksite?.location}
              </Text>
              {upcomingShiftData?.status === 'CLOCK_IN' && (
                <Text
                  style={[
                    styles.description,
                    { fontSize: 14, color: Colors.HOME_DES }
                  ]}
                >
                  Clock in time:{' '}
                  {moment
                    .utc(upcomingShiftData?.schedule_shift_start_time)
                    .local()
                    .format('DD,MMM YYYY hh:mm A')}{' '}
                  to{' '}
                  {moment
                    .utc(upcomingShiftData?.schedule_shift_end_time)
                    .local()
                    .format('hh:mm A')}
                </Text>
              )}
              {shiftNeedClose?.clock_out_time === null && (
                <Text
                  style={[
                    styles.description,
                    { fontSize: 14, color: Colors.HOME_DES }
                  ]}
                >
                  Clock in time:{' '}
                  <Text
                    style={{
                      ...Fonts.poppinsMedium(18),
                      color: Colors.BLACK
                    }}
                  >
                    {moment
                      .utc(
                        upcomingShiftTimesData?.length > 0
                          ? upcomingShiftTimesData[
                              upcomingShiftTimesData?.length - 1
                            ]?.clock_in_time
                          : upcomingShiftData?.schedule_shift_start_time
                      )
                      .local()
                      .format('hh:mm A')}{' '}
                  </Text>
                </Text>
              )}
            </View>
            <Image {...Images.calendar} style={styles.image} />
          </View>
          {user?.role !== 'Organization Admin' && renderClockButton()}
          {user?.role !== 'Organization Admin' &&
            shiftNeedClose?.clock_out_time === null &&
            renderClockEndButton()}
          <Modal
            visible={visible}
            transparent
            onDismiss={hideModal}
            onRequestClose={hideModal}
          >
            <View style={styles.centerMode}>
              <ScrollView style={styles.modal}>
                <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
                  <TouchableOpacity onPress={hideModal}>
                    <Icon name="close" type="antdesign" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.title}>Task check</Text>
                <Text style={{ ...Fonts.poppinsRegular(12), marginBottom: 20 }}>
                  {upcomingShiftData?.worksite?.name}
                </Text>

                <Text
                  style={{
                    ...Fonts.poppinsRegular(12),
                    textTransform: 'uppercase',
                    textAlign: 'right',
                    width: '100%',
                    color: Colors.BLUR_TEXT
                  }}
                >
                  {'Mark as done'}
                </Text>
                {upcomingShiftData?.worksite?.tasks?.map(task => (
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between',
                      marginVertical: 10,
                      alignItems: 'center',
                      paddingBottom: 8,
                      borderBottomColor: Colors.TEXT_INPUT_BORDER,
                      borderBottomWidth: 1
                    }}
                  >
                    <Text style={styles.inputText}>{task?.name}</Text>
                    <BouncyCheckbox
                      size={20}
                      fillColor={Colors.BACKGROUND_BG}
                      disableBuiltInState
                      iconStyle={{
                        borderColor: Colors.BLACK,
                        borderRadius: 1,
                        marginBottom: 2
                      }}
                      onPress={() => {
                        if (completed_tasks?.some(e => e === task?.id)) {
                          const removed = completed_tasks?.filter(
                            e => e !== task?.id
                          )
                          handleChange('completed_tasks', removed)
                        } else {
                          handleChange('completed_tasks', [
                            ...completed_tasks,
                            task?.id
                          ])
                        }
                      }}
                      isChecked={completed_tasks?.includes(task?.id)}
                    />
                  </View>
                ))}
                <Text style={[styles.title, { marginTop: 30 }]}>Notes</Text>
                <PrimaryTextInput
                  text={notes}
                  style={{ width: '110%' }}
                  label={'Notes'}
                  key="notes"
                  placeholder="Notes"
                  onChangeText={(text, isValid) => handleChange('notes', text)}
                />

                <Button
                  style={[styles.footerWhiteButton]}
                  onPress={() => _uploadImage('', 'notes_media')}
                  title={'Upload media'}
                  icon={'upload'}
                  isWhiteBg
                  iconStyle={{
                    width: 20,
                    height: 20,
                    tintColor: Colors.GREEN_COLOR,
                    resizeMode: 'contain'
                  }}
                  color={Colors.BUTTON_BG}
                />
                <Text style={[styles.title, { marginTop: 40 }]}>
                  Feedback/Requests
                </Text>
                <PrimaryTextInput
                  style={{ width: '110%' }}
                  text={feedback}
                  label={'Feedback/Requests'}
                  key="feedback"
                  placeholder="Feedback/Requests"
                  onChangeText={(text, isValid) =>
                    handleChange('feedback', text)
                  }
                />

                <Button
                  style={[styles.footerWhiteButton]}
                  onPress={() => _uploadImage('', 'feedback_media')}
                  title={'Upload media'}
                  icon={'upload'}
                  isWhiteBg
                  iconStyle={{
                    width: 20,
                    height: 20,
                    tintColor: Colors.GREEN_COLOR,
                    resizeMode: 'contain'
                  }}
                  color={Colors.BUTTON_BG}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    marginVertical: 20,
                    alignItems: 'center'
                  }}
                >
                  <BouncyCheckbox
                    size={20}
                    fillColor={Colors.BACKGROUND_BG}
                    disableBuiltInState
                    iconStyle={{
                      borderColor: Colors.BLACK,
                      borderRadius: 1,
                      marginBottom: 2
                    }}
                    onPress={() => handleChange('urgent', !urgent)}
                    isChecked={urgent}
                  />
                  <Text style={[styles.inputText]}>Urgent</Text>
                </View>
                <Text style={[styles.title, { marginTop: 20 }]}>Edit time</Text>
                {upcomingShiftTimesData?.length > 0
                  ? upcomingShiftTimesData?.map((shift, index) => (
                      <>
                        <ClockINOUT
                          shift={shift}
                          key={index}
                          upcomingShiftTimesData={upcomingShiftTimesData}
                          handleChange={handleChange}
                        />
                        {index !== upcomingShiftTimesData?.length - 1 && (
                          <View
                            style={{
                              width: '100%',
                              marginTop: 10,
                              marginBottom: 5,
                              height: 1,
                              backgroundColor: Colors.BLUR_TEXT
                            }}
                          />
                        )}
                      </>
                    ))
                  : null}
                <Button
                  onPress={() => {
                    if (!is_shift_completed) {
                      _updateUpcomingShiftTimes(false)
                    } else {
                      handleChange('visible', false)
                      setTimeout(() => {
                        handleChange('visible1', true)
                      }, 300)
                    }
                  }}
                  disabled={
                    !notes ||
                    !feedback ||
                    // !clock_in_time ||
                    !notes_media ||
                    !feedback_media ||
                    // !clock_out_time ||
                    completed_tasks.length === 0
                  }
                  loading={loadingSubmit}
                  title={'Submit'}
                  style={{
                    width: '100%'
                  }}
                />
                <Button
                  onPress={() => handleChange('visible', false)}
                  title={'Cancel'}
                  isWhiteBg
                  color={Colors.BACKGROUND_BG}
                  style={{
                    width: '100%',
                    marginBottom: 20
                  }}
                />
              </ScrollView>
            </View>
          </Modal>
          <Modal
            visible={visible1}
            transparent
            onDismiss={hideModal}
            onRequestClose={hideModal}
          >
            <View style={[styles.centerMode, { justifyContent: 'center' }]}>
              <View style={[styles.modal, { borderRadius: 10 }]}>
                <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
                  <TouchableOpacity onPress={hideModal}>
                    <Icon name="close" type="antdesign" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.title}>How are you feeling today?</Text>
                <FlatList
                  data={feelings}
                  numColumns={3}
                  style={{ width: '100%' }}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: '30%',
                        marginRight: 5,
                        marginTop: 5,
                        marginLeft: 5
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          handleChange('selectedFeeling', item.key)
                        }
                        style={{
                          height: 80,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor:
                            selectedFeeling === item.key
                              ? Colors.TEXT_INPUT_BORDER
                              : Colors.WHITE,
                          borderRadius: 10,
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5
                        }}
                      >
                        <SvgXml xml={item.icon} />
                      </TouchableOpacity>
                      <Text
                        style={{
                          ...Fonts.poppinsRegular(12),
                          textAlign: 'center',
                          width: '100%',
                          color: Colors.BLACK,
                          marginTop: 5
                        }}
                      >
                        {item.key}
                      </Text>
                    </View>
                  )}
                />

                <Button
                  onPress={_createAttendance}
                  loading={loadingSubmit}
                  title={'Submit'}
                  style={{
                    width: '100%',
                    marginBottom: 20
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dedede',
    borderRadius: 10,
    padding: 15
  },
  inputStyle: {
    height: 50,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    paddingHorizontal: 15,
    ...Fonts.poppinsRegular(14),
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER
  },
  title: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR
  },
  footerButton: {
    marginTop: '15%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 10
  },
  inputText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left'
  },
  image: {
    tintColor: Colors.BUTTON_BG,
    resizeMode: 'contain',
    width: 30,
    height: 30
  },
  centerMode: {
    backgroundColor: Colors.MODAL_BG,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: Colors.WHITE,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    width: '90%',
    maxHeight: '90%'
  },
  title: {
    ...Fonts.poppinsMedium(18),
    color: Colors.TEXT_COLOR,
    width: '90%'
  },
  footerWhiteButton: {
    marginTop: '5%',
    height: 40,
    width: '100%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  }
})
