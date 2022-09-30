import React, { useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Calendar } from 'react-native-big-calendar'
import Colors from '../../res/Theme/Colors'
import calendarLogo from '../../res/Images/common/calendarLogo.png'
import { Fonts } from '../../res/Theme'
import Header from '../Common/Header'
import userProfile from '../../res/Images/common/sample.png'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu'
import { Icon } from 'react-native-elements'
import Button from '../Common/Button'
import moment from 'moment'
import { useContext } from 'react'
import AppContext from '../../Utils/Context'
import Fab from '../Common/Fab'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import DatePicker from 'react-native-date-picker'
import momenttimezone from 'moment-timezone'
import Strings from '../../res/Strings'

export default function Scheduler ({ navigation }) {
  const { schedules, _getAllSchedules } = useContext(AppContext)
  const [state, setState] = useState({
    mode: 'week',
    openSelect: false,
    visible: false,
    date: new Date(),
    date_text: '',
    selectedEvent: null
  })
  useFocusEffect(
    useCallback(() => {
      _getAllSchedules('')
    }, [])
  )

  const { mode, date_text, openSelect, date, visible, selectedEvent } = state

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  const hideModal = () => {
    handleChange('selectedEvent', null)
    handleChange('visible', false)
  }

  const renderEvent = (event, touchableOpacityProps) => (
    <TouchableOpacity
      // {...touchableOpacityProps}
      onPress={() => {
        handleChange('visible', true)
        handleChange('selectedEvent', event)
      }}
      style={[
        touchableOpacityProps.style,
        {
          backgroundColor: event.color,
          borderRadius: 5,
          flexDirection: mode === 'month' ? 'row' : 'column',
          alignItems: 'center'
        }
      ]}
    >
      <Image
        source={event?.logo ? { uri: event?.logo } : calendarLogo}
        style={{
          marginTop: mode === 'day' ? 30 : 0,
          width: mode === 'day' ? 30 : 20,
          resizeMode: 'contain',
          height: mode === 'day' ? 30 : 20
        }}
      />
      <Text
        style={{
          ...Fonts.poppinsRegular(mode === 'day' ? 14 : 8),
          color: Colors.BLACK
        }}
      >{`${event.title}`}</Text>
    </TouchableOpacity>
  )

  function convertLocalDateToUTCDate (time, toLocal) {
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
      const todayDate1 = momenttimezone
        .tz(`${todayDate} ${time}`, today)
        .format()
      const utcTime = moment.utc(todayDate1).format('YYYY-MM-DDTHH:mm')
      return utcTime
    }
  }

  const getEvents = events => {
    if (events?.length > 0) {
      const list = []
      events?.forEach(element => {
        if (element) {
          list.push({
            ...element,
            title: element?.worksite_name,
            color: '#FDB48B',
            start: new Date(
              convertLocalDateToUTCDate(element?.start_time, true)
            ),
            end: new Date(convertLocalDateToUTCDate(element?.end_time, true))
          })
        }
      })
      return list || []
    } else {
      return []
    }
  }

  console.warn('getEvents', getEvents(schedules))
  return (
    <View style={styles.container}>
      <Header leftButton title={'Scheduler'} />
      <View
        style={{
          width: '90%',
          flexDirection: 'row',
          marginBottom: 20,
          marginTop: 10
        }}
      >
        <View style={{ width: '50%' }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: 120,
              alignItems: 'center'
            }}
            onPress={() => handleChange('openSelect', true)}
          >
            <Text
              style={[
                {
                  ...Fonts.poppinsMedium(14),
                  color: Colors.TEXT_COLOR
                }
              ]}
            >
              {date_text || 'Select Month'}
            </Text>
            <Icon
              name={'down'}
              size={12}
              color={Colors.BLACK}
              type={'antdesign'}
            />
          </TouchableOpacity>
          <DatePicker
            modal
            mode={'date'}
            open={openSelect}
            date={date}
            onConfirm={date => {
              handleChange('openSelect', false)
              handleChange('date', date)
              handleChange('date_text', moment(date).format('MMM YYYY'))
            }}
            onCancel={() => {
              handleChange('openSelect', false)
            }}
          />
          <Menu>
            <MenuTrigger style={{ width: '100%', marginTop: 10 }}>
              <View
                style={[
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: 100,
                    marginTop: 0
                  }
                ]}
              >
                <Text
                  style={{
                    ...Fonts.poppinsRegular(12),
                    textTransform: 'capitalize'
                  }}
                >
                  {mode ? mode + ' view' : 'Select Type'}
                </Text>
                <Icon
                  name='down'
                  size={12}
                  color={Colors.BLACK}
                  style={{ marginLeft: 10 }}
                  type='antdesign'
                />
              </View>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                onSelect={() => handleChange(`mode`, 'month')}
                text='Month View'
              />
              <MenuOption
                onSelect={() => handleChange(`mode`, 'week')}
                text='Week View'
              />
              <MenuOption
                onSelect={() => handleChange(`mode`, 'day')}
                text='Day View'
              />
            </MenuOptions>
          </Menu>
        </View>
        <View style={{ width: '50%' }}>
          <Button
            backgroundColor={Colors.BLUR_TEXT}
            style={{ height: 40 }}
            title={'Filter'}
          />
          {mode !== 'month' && (
            <Button
              backgroundColor={Colors.BLUR_TEXT}
              style={{ height: 40 }}
              title={'Publish All'}
            />
          )}
        </View>
      </View>

      <Calendar
        bodyContainerStyle={{ width: '100%' }}
        showAdjacentMonths
        sortedMonthView
        calendarContainerStyle={{ width: '100%', marginTop: 10 }}
        renderEvent={renderEvent}
        mode={mode}
        date={date}
        events={getEvents(schedules)}
        height={600}
      />
      <Fab onPress={() => navigation.navigate('addEvents')} />
      <Modal
        visible={visible}
        transparent
        onDismiss={hideModal}
        onRequestClose={hideModal}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={hideModal}>
                <Icon name='close' type='antdesign' />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{selectedEvent?.title}</Text>
            <Text style={{ ...Fonts.poppinsRegular(12), marginBottom: 20 }}>
              {selectedEvent?.start_time}
            </Text>
            <Text style={styles.title}>{'Tasks'}</Text>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                marginVertical: 10,
                alignItems: 'center',
                paddingBottom: 8,
                borderBottomColor: Colors.TEXT_INPUT_BORDER,
                borderBottomWidth: 1
              }}
            >
              <Text style={styles.inputText}>{'task?.name'}</Text>
            </View>
            <Text style={styles.title}>{'Assigned Employees'}</Text>
            <FlatList
              data={[0]}
              style={{ width: '100%', marginTop: 20 }}
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
                  <Text
                    style={{
                      ...Fonts.poppinsRegular(12),
                      color: Colors.BLUR_TEXT
                    }}
                  >
                    Phone Number:
                  </Text>
                </View>
              )}
            />
            <Button
              style={[styles.footerWhiteButton]}
              onPress={() => {
                navigation.navigate('addEvents', { selectedEvent })
                hideModal()
              }}
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
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    height: '100%'
  },
  logo: {
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
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
    padding: 20,
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