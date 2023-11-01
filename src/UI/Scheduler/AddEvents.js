import React, { useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native'
import Colors from '../../res/Theme/Colors'
import { Fonts } from '../../res/Theme'
import Header from '../Common/Header'
import { Icon } from 'react-native-elements'
import Button from '../Common/Button'
import moment from 'moment'
import momenttimezone from 'moment-timezone'
import { useContext } from 'react'
import AppContext from '../../Utils/Context'
import PrimaryTextInput from '../Common/PrimaryTextInput'
import { TouchableOpacity } from 'react-native'
import DatePicker from 'react-native-date-picker'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  createEvent,
  deleteEvent,
  getAllEmployee,
  getAllWorksites,
  getEventDetails,
  updateEvent
} from '../../api/business'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { FlatList } from 'react-native'
import { Image } from 'react-native'
import userProfile from '../../res/Images/common/sample.png'

export default function AddEvents({ navigation, route }) {
  const selectedEvent = route?.params?.selectedEvent
  const { schedules } = useContext(AppContext)
  const [state, setState] = useState({
    mode: 'week',
    worksite: '',
    start_date: '',
    end_date: '',
    frequency: '',
    description: '',
    start_time: new Date(),
    start_time_text: '',
    end_time: new Date(),
    frequency_end_date: new Date(),
    end_time_text: '',
    notes: '',
    openStart: false,
    reminder: false,
    loading: false,
    visible: false,
    schedule_inspection: false,
    loadingDelete: false,
    loadingMain: false,
    openEnd: false,
    visible1: false,
    worksiteOptions: [],
    selected_tasks: [],
    allEmployee: [],
    employees: [],
    event_status: '',
    publishing_reminder: '',
    eventDetails: null,
    deleteAll: false,
    deleteThis: true,
    deleteFollowing: false
  })
  const {
    end_date,
    worksite,
    start_date,
    end_time,
    endStart,
    end_time_text,
    frequency,
    frequency_end_date,
    description,
    notes,
    reminder,
    schedule_inspection,
    openStart,
    start_time,
    start_time_text,
    allWorksites,
    worksiteOptions,
    selected_tasks,
    allEmployee,
    employees,
    event_status,
    publishing_reminder,
    loading,
    eventDetails,
    visible,
    visible1,
    loadingDelete,
    loadingMain,
    deleteAll,
    deleteFollowing,
    deleteThis
  } = state

  const reminderList = [
    { label: '1 Day', value: 'ONE_DAY' },
    { label: '2 Days', value: 'TWO_DAYS' },
    { label: '1 Week', value: 'ONE_WEEK' },
    { label: '2 Weeks', value: 'TWO_WEEKS' },
    { label: '1 Month', value: 'ONE_MONTH' }
  ]

  const getReminderListText = value => {
    const filtered = reminderList.filter(e => e.value === value)
    return filtered.length > 0 ? filtered[0].label : ''
  }

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      _getAllWorksites()
      _getAllEmployee()
      if (selectedEvent) {
        _getEventDetails()
      }
    }, [selectedEvent])
  )

  function convertLocalDateToUTCDate(time, toLocal) {
    const todayDate = moment(new Date()).format('YYYY-MM-DD')
    if (toLocal) {
      const today = momenttimezone.tz.guess()
      const timeUTC = momenttimezone.tz(`${time}`, today).format()
      let date = new Date(timeUTC)
      const milliseconds = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
      const localTime = new Date(milliseconds)
      const todayDate1 = momenttimezone.tz(localTime, today).format()
      return todayDate1
    } else {
      const today = momenttimezone.tz.guess()
      const todayDate1 = momenttimezone.tz(time, today).format()
      const utcTime = moment.utc(todayDate1).format('YYYY-MM-DD HH:mm:ss')
      return utcTime
    }
  }

  const handleSubmit = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        worksite,
        start_time: moment
          .utc(moment(start_date + ' ' + start_time_text))
          .format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment
          .utc(moment(end_date + ' ' + end_time_text))
          .format('YYYY-MM-DD HH:mm:ss'),
        description,
        notes,
        reminder,
        schedule_inspection,
        event_status,
        employees,
        selected_tasks
      }
      publishing_reminder && (payload.publishing_reminder = publishing_reminder)
      frequency && (payload.frequency = frequency)
      frequency_end_date &&
        (payload.frequency_end_date = moment
          .utc(moment(frequency_end_date))
          .format('YYYY-MM-DD'))
      if (selectedEvent) {
        await updateEvent(selectedEvent?.id, payload, token)
        Toast.show('Event has been updated')
      } else {
        await createEvent(payload, token)
        Toast.show('Event has been created')
      }
      handleChange('loading', false)
      handleChange('visible1', false)
      navigation.goBack()
    } catch (error) {
      handleChange('loading', false)
      const showWError = Object.values(error.response?.data)
      const showWError1 = Object.values(error.response?.data?.error)
      if (showWError1?.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError1[0])}`)
      } else if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const _getAllEmployee = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await getAllEmployee(token)
      handleChange('loading', false)
      handleChange('allEmployee', res?.data?.results)
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

  const _getAllWorksites = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await getAllWorksites(token)
      handleChange('allWorksites', res?.data?.results)
      const list = []
      res?.data?.results?.forEach(element => {
        if (element) {
          list.push({
            value: element?.id,
            label: element?.personal_information?.name
          })
        }
      })
      handleChange('worksiteOptions', list)
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

  const _getEventDetails = async () => {
    try {
      handleChange('loadingMain', true)
      const token = await AsyncStorage.getItem('token')
      const res = await getEventDetails(selectedEvent?.id, token)
      // console.warn('res?.data', res?.data)
      handleChange('loadingMain', false)
      handleChange('eventDetails', res?.data)
      handleChange('worksite', res?.data?.worksite)
      handleChange(
        'start_date',
        moment.utc(res?.data?.start_time).local().format('MM/DD/YYYY')
      )
      handleChange(
        'start_time',
        new Date(moment.utc(res?.data?.start_time).local().format())
      )
      handleChange(
        'start_time_text',
        moment.utc(res?.data?.start_time).local().format('hh:mm A')
      )
      handleChange(
        'end_date',
        moment.utc(res?.data?.end_time).local().format('MM/DD/YYYY')
      )
      handleChange(
        'end_time',
        new Date(moment.utc(res?.data?.end_time).local().format())
      )
      handleChange(
        'end_time_text',
        moment.utc(res?.data?.end_time).local().format('hh:mm A')
      )
      handleChange('frequency', res?.data?.frequency)
      handleChange(
        'frequency_end_date',
        moment.utc(res?.data?.frequency_end_date).local().format('MM/DD/YYYY')
      )
      handleChange('description', res?.data?.description)
      handleChange('notes', res?.data?.notes)
      handleChange('reminder', res?.data?.reminder)
      handleChange('schedule_inspection', res?.data?.schedule_inspection)
      handleChange('event_status', res?.data?.event_status)
      handleChange('employees', res?.data?.employees)
      handleChange('selected_tasks', res?.data?.selected_tasks)
      handleChange('publishing_reminder', res?.data?.publishing_reminder)
    } catch (error) {
      handleChange('loadingMain', false)
      // console.warn('err', error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const _deleteEvent = async () => {
    try {
      handleChange('loadingDelete', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        event: selectedEvent?.id,
        all_events: deleteAll,
        this_and_following_event: deleteFollowing
      }
      const res = await deleteEvent(payload, token)
      handleChange('loadingDelete', false)
      handleChange('visible', false)
      navigation.goBack()
    } catch (error) {
      handleChange('loadingDelete', false)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }
  const getWorksiteText = id => {
    const filtered = allWorksites?.filter(e => e.id === id)
    return (
      (filtered?.length > 0 && filtered[0]?.personal_information?.name) || ''
    )
  }

  // console.warn('frequency', frequency)

  const getWorksiteTask = id => {
    const filtered = allWorksites?.filter(e => e.id === id)
    return (filtered?.length > 0 && filtered[0]?.tasks) || []
  }
  if (loadingMain) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <ActivityIndicator color={Colors.GREEN_COLOR} size={'large'} />
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <Header
        leftButton
        onLeftPress={() => navigation.goBack()}
        title={eventDetails ? 'Edit Event' : 'Create Event'}
      />
      <Text style={styles.title}>{'Event information'}</Text>
      <PrimaryTextInput
        dropdown={true}
        text={getWorksiteText(worksite)}
        items={worksiteOptions}
        label={getWorksiteText(worksite) || 'Worksite'}
        key="worksite"
        // placeholder='worksite'
        onChangeText={(text, isValid) => handleChange('worksite', text)}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '95%',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ width: '50%' }}>
          <PrimaryTextInput
            dateType={true}
            text={start_date}
            maxDate={new Date('2050/01/01')}
            label="From"
            key="start_date"
            placeholder="start_date"
            onChangeText={(text, isValid) => handleChange('start_date', text)}
          />
        </View>
        <View style={{ width: '50%' }}>
          <PrimaryTextInput
            dateType={true}
            maxDate={new Date('2050/01/01')}
            text={end_date}
            label="To"
            key="end_date"
            placeholder="end_date"
            onChangeText={(text, isValid) => handleChange('end_date', text)}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '90%',
          marginVertical: 10,
          justifyContent: 'space-between'
        }}
      >
        <View style={{ width: '48%' }}>
          <TouchableOpacity
            style={styles.inputStyle}
            onPress={() => handleChange('openStart', true)}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: start_time_text ? Colors.TEXT_COLOR : Colors.BLUR_TEXT
                }
              ]}
            >
              {start_time_text || 'From'}
            </Text>
            <Icon
              name={'time-outline'}
              type={'ionicon'}
              color={Colors.BLUR_TEXT}
            />
          </TouchableOpacity>
          <DatePicker
            modal
            open={openStart}
            mode={'time'}
            date={start_time}
            onConfirm={date => {
              handleChange('openStart', false)
              handleChange('start_time', date)
              handleChange('start_time_text', moment(date).format('hh:mm A'))
            }}
            onCancel={() => {
              handleChange('openStart', false)
            }}
          />
        </View>
        <View style={{ width: '47%' }}>
          <TouchableOpacity
            style={styles.inputStyle}
            onPress={() => handleChange('endStart', true)}
          >
            <Text
              style={[
                styles.inputText,
                {
                  color: end_time_text ? Colors.TEXT_COLOR : Colors.BLUR_TEXT
                }
              ]}
            >
              {end_time_text || 'To'}
            </Text>
            <Icon
              name={'time-outline'}
              type={'ionicon'}
              color={Colors.BLUR_TEXT}
            />
          </TouchableOpacity>
          <DatePicker
            modal
            mode={'time'}
            open={endStart}
            date={end_time}
            onConfirm={date => {
              handleChange('endStart', false)
              handleChange('end_time', date)
              handleChange('end_time_text', moment(date).format('hh:mm A'))
            }}
            onCancel={() => {
              handleChange('endStart', false)
            }}
          />
        </View>
      </View>
      <PrimaryTextInput
        dropdown={true}
        text={frequency}
        items={[
          { label: 'DAILY', value: 'DAILY' },
          { label: 'WEEKLY', value: 'WEEKLY' },
          { label: 'MONTHLY', value: 'MONTHLY' },
          { label: 'YEARLY', value: 'YEARLY' }
        ]}
        label="Frequency of event"
        key="frequency"
        placeholder="frequency"
        onChangeText={(text, isValid) => handleChange('frequency', text)}
      />
      {frequency !== '' && frequency && (
        <PrimaryTextInput
          dateType={true}
          maxDate={new Date('2050/01/01')}
          minDate={new Date()}
          text={frequency_end_date}
          label="End Date"
          key="frequency_end_date"
          placeholder="End Date"
          onChangeText={(text, isValid) =>
            handleChange('frequency_end_date', text)
          }
        />
      )}
      <PrimaryTextInput
        text={description}
        label="Description"
        key="description"
        placeholder="description"
        onChangeText={(text, isValid) => handleChange('description', text)}
      />
      <PrimaryTextInput
        text={notes}
        label="Notes"
        key="notes"
        placeholder="notes"
        onChangeText={(text, isValid) => handleChange('notes', text)}
      />
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          marginTop: 10,
          alignItems: 'center'
        }}
      >
        {/* <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          unfillColor={Colors.WHITE}
          disableBuiltInState
          innerIconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          iconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          onPress={() => handleChange("reminder", !reminder)}
          isChecked={reminder}
        /> */}
        <Text style={styles.inputText}>
          *Remember to account for the travel time
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          marginTop: 10,
          alignItems: 'center'
        }}
      >
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          disableBuiltInState
          innerIconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          iconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          onPress={() =>
            handleChange('schedule_inspection', !schedule_inspection)
          }
          isChecked={schedule_inspection}
        />
        <Text style={styles.inputText}>Scheduled inspection</Text>
      </View>
      <Text style={styles.title}>Tasks </Text>
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          alignItems: 'center'
        }}
      >
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          disableBuiltInState
          innerIconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          iconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 5,
            marginBottom: 2
          }}
          onPress={() => {
            if (selected_tasks?.length === getWorksiteTask(worksite)?.length) {
              handleChange('selected_tasks', [])
            } else {
              if (getWorksiteTask(worksite)?.length > 0) {
                const tasklist = []
                getWorksiteTask(worksite)?.forEach(element => {
                  if (element) {
                    tasklist.push(element?.id)
                  }
                })
                handleChange('selected_tasks', tasklist)
              }
            }
          }}
          isChecked={
            selected_tasks?.length === getWorksiteTask(worksite)?.length
          }
        />
        <Text style={styles.inputText}>Select all</Text>
      </View>
      <Text style={styles.title}>Every Time</Text>
      {getWorksiteTask(worksite)?.length > 0 &&
        getWorksiteTask(worksite)?.map((task, index) => (
          <View
            style={{
              flexDirection: 'row',
              width: '90%',
              marginVertical: 10,
              alignItems: 'center',
              paddingBottom: 8,
              borderBottomColor: Colors.TEXT_INPUT_BORDER,
              borderBottomWidth: 1
            }}
          >
            <BouncyCheckbox
              size={20}
              fillColor={Colors.BACKGROUND_BG}
              disableBuiltInState
              innerIconStyle={{
                borderColor: Colors.BLUR_TEXT,
                borderRadius: 5,
                marginBottom: 2
              }}
              iconStyle={{
                borderColor: Colors.BLUR_TEXT,
                borderRadius: 5,
                marginBottom: 2
              }}
              onPress={() => {
                if (selected_tasks?.includes(Number(task?.id))) {
                  const removed = selected_tasks?.filter(
                    e => e !== Number(task?.id)
                  )
                  handleChange('selected_tasks', removed)
                } else {
                  handleChange('selected_tasks', [
                    ...selected_tasks,
                    Number(task?.id)
                  ])
                }
              }}
              isChecked={selected_tasks?.includes(Number(task?.id))}
            />
            <Text style={[styles.inputText, { width: '90%' }]}>
              {task?.name}
            </Text>
          </View>
        ))}
      <Text style={styles.title}>{'Assign Employees'}</Text>
      <FlatList
        data={allEmployee}
        style={{ width: '90%', marginTop: 20 }}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              borderBottomWidth: 1,
              paddingBottom: 10,
              borderBottomColor: Colors.TEXT_INPUT_BORDER
            }}
          >
            <Image
              source={
                item?.personal_information?.profile_image
                  ? { uri: item?.personal_information?.profile_image }
                  : userProfile
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                marginRight: 20
              }}
            />
            <Text style={{ ...Fonts.poppinsRegular(12) }}>
              {item?.personal_information?.first_name}
            </Text>
            <BouncyCheckbox
              size={20}
              fillColor={Colors.BACKGROUND_BG}
              disableBuiltInState
              innerIconStyle={{
                borderColor: Colors.BLUR_TEXT,
                borderRadius: 5,
                marginBottom: 2
              }}
              iconStyle={{
                borderColor: Colors.BLUR_TEXT,
                borderRadius: 5,
                marginBottom: 2
              }}
              style={{ right: 0, position: 'absolute' }}
              onPress={() => {
                if (employees?.includes(Number(item?.id))) {
                  const removed = employees?.filter(e => e !== Number(item?.id))
                  handleChange('employees', removed)
                } else {
                  handleChange('employees', [...employees, Number(item?.id)])
                }
              }}
              isChecked={employees?.includes(Number(item?.id))}
            />
          </View>
        )}
      />
      <Text style={styles.title}>{'Event Status'}</Text>
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          alignItems: 'center'
        }}
      >
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          disableBuiltInState
          innerIconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 20,
            marginBottom: 2
          }}
          iconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 20,
            marginBottom: 2
          }}
          onPress={() => {
            if (event_status === 'DRAFT') {
              handleChange('event_status', '')
            } else {
              handleChange('event_status', 'DRAFT')
            }
          }}
          isChecked={event_status === 'DRAFT'}
        />
        <Text style={styles.inputText}>Draft</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          marginTop: 10,
          alignItems: 'center'
        }}
      >
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          disableBuiltInState
          innerIconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 20,
            marginBottom: 2
          }}
          iconStyle={{
            borderColor: Colors.BLUR_TEXT,
            borderRadius: 20,
            marginBottom: 2
          }}
          onPress={() => {
            if (event_status === 'PUBLISHED') {
              handleChange('event_status', '')
            } else {
              handleChange('event_status', 'PUBLISHED')
            }
          }}
          isChecked={event_status === 'PUBLISHED'}
        />
        <Text style={styles.inputText}>Published</Text>
      </View>
      <Text style={[styles.title, { ...Fonts.poppinsMedium(18) }]}>
        Reminder for publishing draft event
      </Text>
      <PrimaryTextInput
        dropdown={true}
        text={getReminderListText(publishing_reminder)}
        items={reminderList}
        label="Reminder of event"
        key="publishing_reminder"
        placeholder="publishing_reminder"
        onChangeText={(text, isValid) =>
          handleChange('publishing_reminder', text)
        }
      />
      <View style={{ width: '100%', marginBottom: 20 }}>
        {selectedEvent && (
          <Button
            color={Colors.BUTTON_BG}
            iconStyle={{
              width: 20,
              height: 20,
              tintColor: Colors.GREEN_COLOR,
              resizeMode: 'contain'
            }}
            style={[styles.footerWhiteButton]}
            onPress={() => handleChange('visible', true)}
            title={'Delete'}
            isWhiteBg
            icon={'delete'}
          />
        )}
        <Button
          backgroundColor={Colors.BACKGROUND_BG}
          style={{ height: 40 }}
          loading={loading}
          disabled={
            // !frequency ||
            // !description ||
            !start_date ||
            !start_time ||
            !start_time_text ||
            !end_date ||
            !end_time ||
            !end_time_text ||
            !frequency ||
            !event_status ||
            employees.length === 0 ||
            selected_tasks.length === 0
          }
          onPress={() =>
            event_status === 'PUBLISHED'
              ? handleChange('visible1', true)
              : handleSubmit()
          }
          title={selectedEvent ? 'Save' : 'Create'}
        />
      </View>
      <Modal
        visible={visible}
        transparent
        onDismiss={() => handleChange('visible', false)}
        onRequestClose={() => handleChange('visible', false)}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handleChange('visible', false)}>
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { textAlign: 'center' }]}>
              {'Are you sure you want to delete this event?'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                marginLeft: '5%',
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <BouncyCheckbox
                size={20}
                fillColor={Colors.BACKGROUND_BG}
                disableBuiltInState
                innerIconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                iconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                onPress={() => {
                  handleChange('deleteFollowing', false)
                  handleChange('deleteThis', false)
                  handleChange('deleteAll', !deleteAll)
                }}
                isChecked={deleteAll}
              />
              <Text style={styles.inputText}>Delete All Frequency Events</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                marginLeft: '5%',
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <BouncyCheckbox
                size={20}
                fillColor={Colors.BACKGROUND_BG}
                disableBuiltInState
                innerIconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                iconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                onPress={() => {
                  handleChange('deleteAll', false)
                  handleChange('deleteThis', false)
                  handleChange('deleteFollowing', !deleteFollowing)
                }}
                isChecked={deleteFollowing}
              />
              <Text style={styles.inputText}>
                Delete This And Following Events
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                marginLeft: '5%',
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <BouncyCheckbox
                size={20}
                fillColor={Colors.BACKGROUND_BG}
                disableBuiltInState
                innerIconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                iconStyle={{
                  borderColor: Colors.BLUR_TEXT,
                  borderRadius: 20,
                  marginBottom: 2
                }}
                onPress={() => {
                  handleChange('deleteFollowing', false)
                  handleChange('deleteAll', false)
                  handleChange('deleteThis', !deleteThis)
                }}
                isChecked={deleteThis}
              />
              <Text style={styles.inputText}>Delete This Event</Text>
            </View>
            <Button
              style={{ height: 40 }}
              onPress={_deleteEvent}
              loading={loadingDelete}
              title={'Yes'}
            />
            <Button
              style={{ height: 40 }}
              onPress={() => handleChange('visible', false)}
              isWhiteBg
              color={Colors.GREEN_COLOR}
              backgroundColor={'transparent'}
              title={'Cancel'}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={visible1}
        transparent
        onDismiss={() => handleChange('visible1', false)}
        onRequestClose={() => handleChange('visible1', false)}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => handleChange('visible1', false)}>
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { marginTop: -20 }]}>Message</Text>
            <Text
              style={[
                styles.title,
                { marginTop: 10, ...Fonts.poppinsRegular(14) }
              ]}
            >
              {
                'All impacted employees will receive a notification regarding the shift change'
              }
            </Text>
            <Button
              style={{ height: 40 }}
              onPress={handleSubmit}
              disabled={loading}
              title={'Publish'}
            />
            <Button
              onPress={handleSubmit}
              disabled={loading}
              isWhiteBg
              style={{
                height: 40,
                marginTop: 10,
                borderWidth: 1,
                borderColor: Colors.BACKGROUND_BG
              }}
              color={Colors.GREEN_COLOR}
              title={'Do not notify'}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    height: '100%'
  },
  logo: {
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  title: {
    ...Fonts.poppinsMedium(20),
    color: Colors.TEXT_COLOR,
    margin: 20,
    width: '90%'
  },
  titleText: {
    color: Colors.WHITE,
    ...Fonts.poppinsMedium(18),
    alignSelf: 'center',
    width: '70%',
    textAlign: 'center'
  },
  headerCommon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageLogo: {
    height: 300,
    width: 128,
    resizeMode: 'contain'
  },
  inputStyle: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    paddingHorizontal: 15,
    ...Fonts.poppinsRegular(14),
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER
  },
  inputText: {
    color: Colors.TEXT_INPUT_COLOR,
    ...Fonts.poppinsRegular(14)
  },
  footerWhiteButton: {
    marginTop: '5%',
    height: 40,
    width: '90%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
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
