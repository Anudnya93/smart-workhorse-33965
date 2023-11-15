import moment from 'moment-timezone'
import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { Colors, Fonts } from '../../res'
import DatePicker from 'react-native-date-picker'
import { Button } from '../Common'
import { Icon } from 'react-native-elements'

export default function ClockINOUT({
  shift,
  handleChange,
  upcomingShiftTimesData
}) {
  const [localstate, setLocalState] = useState({
    is_clock_in_time: false,
    is_clock_out_time: false,
    openStart: false,
    openEnd: false,
    clock_in_time: moment.utc(shift?.clock_in_time).local().format('hh:mm A'),
    clock_in_timeDate: shift?.clock_in_time
      ? new Date(moment(shift?.clock_in_time))
      : new Date(),
    clock_out_time: moment
      .utc(shift?.clock_out_time || new Date())
      .local()
      .format('hh:mm A'),
    clock_out_timeDate: shift?.clock_out_time
      ? new Date(moment(shift?.clock_out_time))
      : new Date()
  })
  const {
    is_clock_in_time,
    is_clock_out_time,
    openStart,
    openEnd,
    clock_in_time,
    clock_in_timeDate,
    clock_out_time,
    clock_out_timeDate
  } = localstate

  const handleChangeLocal = (name, value) => {
    setLocalState(pre => ({ ...pre, [name]: value }))
  }

  const handleSave = () => {
    const list = []
    upcomingShiftTimesData?.forEach(element => {
      if (element?.id === shift?.id) {
        list.push({
          id: element?.id,
          clock_in_time: moment
            .utc(moment(clock_in_timeDate))
            .format('YYYY-MM-DD HH:mm:ss'),
          clock_out_time: moment
            .utc(moment(clock_out_timeDate))
            .format('YYYY-MM-DD HH:mm:ss')
        })
      } else {
        list.push(element)
      }
    })
    handleChange('upcomingShiftTimesData', list)
    handleChangeLocal('is_clock_out_time', false)
    handleChangeLocal('is_clock_in_time', false)
  }

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          marginVertical: 10,
          alignItems: 'center'
        }}
      >
        {is_clock_in_time ? (
          <View style={{ width: '60%' }}>
            <TouchableOpacity
              style={styles.inputStyle}
              onPress={() => handleChangeLocal('openStart', true)}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: clock_in_time ? Colors.TEXT_COLOR : Colors.BLUR_TEXT
                  }
                ]}
              >
                {clock_in_time || 'Clock In Time'}
              </Text>
              <Icon
                name={'time-outline'}
                type={'ionicon'}
                color={Colors.BLUR_TEXT}
              />
            </TouchableOpacity>
            <DatePicker
              theme="light"
              modal
              open={openStart}
              mode={'time'}
              date={clock_in_timeDate}
              onConfirm={date => {
                handleChangeLocal('openStart', false)
                handleChangeLocal('clock_in_timeDate', date)
                handleChangeLocal(
                  'clock_in_time',
                  moment(date).format('hh:mm A')
                )
              }}
              onCancel={() => {
                handleChangeLocal('openStart', false)
              }}
            />
          </View>
        ) : (
          <Text style={[styles.inputText, { marginTop: 10 }]}>
            Clock in time: {clock_in_time}
          </Text>
        )}
        <Button
          onPress={() =>
            handleChangeLocal('is_clock_in_time', !is_clock_in_time)
          }
          title={is_clock_in_time ? 'Save' : 'Edit'}
          icon={is_clock_in_time ? '' : 'edit'}
          iconStyle={{ width: 15, height: 15, color: '#fff' }}
          backgroundColor={
            is_clock_in_time ? Colors.BACKGROUND_BG : Colors.BUTTON_BG1
          }
          style={{
            width: '30%'
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 10,
          alignItems: 'center',
          paddingBottom: 8
        }}
      >
        {is_clock_out_time ? (
          <View style={{ width: '60%' }}>
            <TouchableOpacity
              style={styles.inputStyle}
              onPress={() => handleChangeLocal('openEnd', true)}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: clock_out_time ? Colors.TEXT_COLOR : Colors.BLUR_TEXT
                  }
                ]}
              >
                {clock_out_time || 'Clock Out Time'}
              </Text>
              <Icon
                name={'time-outline'}
                type={'ionicon'}
                color={Colors.BLUR_TEXT}
              />
            </TouchableOpacity>
            <DatePicker
              theme="light"
              modal
              open={openEnd}
              mode={'time'}
              date={clock_out_timeDate}
              onConfirm={date => {
                handleChangeLocal('openEnd', false)
                handleChangeLocal('clock_out_timeDate', date)
                handleChangeLocal(
                  'clock_out_time',
                  moment(date).format('hh:mm A')
                )
              }}
              onCancel={() => {
                handleChangeLocal('openEnd', false)
              }}
            />
          </View>
        ) : (
          <Text style={[styles.inputText, { marginTop: 10 }]}>
            Clock out time: {clock_out_time}
          </Text>
        )}
        <Button
          onPress={() => {
            if (is_clock_out_time) {
              handleSave()
            } else {
              handleChangeLocal('is_clock_out_time', !is_clock_out_time)
            }
          }}
          title={is_clock_out_time ? 'Save' : 'Edit'}
          icon={is_clock_out_time ? '' : 'edit'}
          iconStyle={{ width: 15, height: 15, color: '#fff' }}
          backgroundColor={
            is_clock_out_time ? Colors.BACKGROUND_BG : Colors.BUTTON_BG1
          }
          style={{
            width: '30%'
          }}
        />
      </View>
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
