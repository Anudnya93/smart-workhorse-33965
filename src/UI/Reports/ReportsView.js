import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native'
import { Header } from '../Common'
import { Fonts, Images, Colors } from '../../res'
import { Button } from '../Common'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu'
import { Icon } from 'react-native-elements'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  inspectionReports,
  locationVarianceReports,
  payrollReports,
  scheduleVarianceReports
} from '../../api/business'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import Fab from '../Common/Fab'
import PieChart from 'react-native-pie-chart'
import { Modal } from 'react-native'
import PrimaryTextInput from '../Common/PrimaryTextInput'
import momenttimezone from 'moment-timezone'
import moment from 'moment'
// import { convertLocalDateToUTCDate } from '../../Utils'

export default function ReportsView({ navigation, route }) {
  const title = route?.params?.title
  const series = [123, 321, 123]
  const sliceColor = ['#23C263', '#EFF259', '#F84F31']
  const [state, setState] = useState({
    loading: false,
    visible: false,
    reports: [],
    reportsFiltered: [],
    from: '',
    to: ''
  })

  const { loading, visible, reportsFiltered, reports, from, to } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

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
      const todayDate1 = momenttimezone
        .tz(`${todayDate} ${time}`, today)
        .format()
      const utcTime = moment.utc(todayDate1).format('YYYY-MM-DDTHH:mm')
      return utcTime
    }
  }

  useFocusEffect(
    useCallback(() => {
      _getReports()
    }, [])
  )

  const _getReportsByFilter = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const payload = `?from=${moment(from).format('YYYY-MM-DD')}&to=${moment(
        to
      ).format('YYYY-MM-DD')}`
      let res
      if (title === 'Schedule Variances') {
        res = await scheduleVarianceReports(payload, token)
      } else if (title === 'Location Variances') {
        res = await locationVarianceReports(payload, token)
      } else if (title === 'Payroll Reports') {
        res = await payrollReports(payload, token)
      } else if (title === 'Inspection') {
        res = await inspectionReports(payload, token)
      }
      if (res?.data) {
        handleChange('reports', res?.data?.results || res?.data?.response)
      }
      handleChange('loading', false)
      handleChange('visible', false)
    } catch (error) {
      handleChange('loading', false)
      Toast.show(`Error: ${error.message}`)
    }
  }

  const _getReports = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      let res
      if (title === 'Schedule Variances') {
        res = await scheduleVarianceReports('', token)
      } else if (title === 'Location Variances') {
        res = await locationVarianceReports('', token)
      } else if (title === 'Payroll Reports') {
        res = await payrollReports('', token)
      } else if (title === 'Inspection') {
        res = await inspectionReports('', token)
      }
      if (res?.data) {
        handleChange('reports', res?.data?.results || res?.data?.response)
        handleChange(
          'reportsFiltered',
          res?.data?.results || res?.data?.response
        )
      }
      handleChange('loading', false)
    } catch (error) {
      handleChange('loading', false)
      Toast.show(`Error: ${error.message}`)
    }
  }

  const handleClose = () => {
    handleChange('visible', false)
  }
  // console.warn("reports", reports)
  const sortBy = type => {
    function sortFunction(a, b) {}
    if (type === 'za') {
      const sorted = reports?.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        var dateA = new Date(b.updated_at || b?.created_at).getTime()
        var dateB = new Date(a.updated_at || a?.created_at).getTime()
        return dateA > dateB ? 1 : -1
      })
      // console.warn("sorted", sorted)
      handleChange('reportsFiltered', sorted)
    }
    if (type === 'az') {
      const sorted = reports?.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        var dateA = new Date(a.updated_at || a?.created_at).getTime()
        var dateB = new Date(b.updated_at || b?.created_at).getTime()
        return dateA > dateB ? 1 : -1
      })
      // console.warn("sorted", sorted)
      handleChange('reportsFiltered', sorted)
    }
  }

  function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h${minutes > 0 ? ` ${minutes.toFixed(0)}m` : ''}`
  }

  return (
    <View style={styles.container}>
      <Header
        back
        leftButton
        title={title + ' Reports'}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ width: '100%' }}
      >
        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            width: '90%',
            justifyContent: 'space-between'
          }}
        >
          <Menu
            style={{
              width: '45%',
              borderWidth: 1,
              borderColor: Colors.TEXT_INPUT_BORDER,
              borderRadius: 10
            }}
          >
            <MenuTrigger
              customStyles={{
                TriggerTouchableComponent: TouchableOpacity
              }}
              style={{
                width: '100%',
                height: 35,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View
                style={[
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '90%',
                    marginTop: 0
                  }
                ]}
              >
                <Text
                  style={{
                    color: Colors.BUTTON_BG1,
                    ...Fonts.poppinsRegular(12),
                    textTransform: 'capitalize'
                  }}
                >
                  {'Sort by'}
                </Text>
                <Icon
                  name="down"
                  size={12}
                  color={Colors.BUTTON_BG1}
                  style={{ marginLeft: 10 }}
                  type="antdesign"
                />
              </View>
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={{
                borderRadius: 10,
                marginTop: 35,
                width: '40%'
              }}
            >
              <MenuOption onSelect={() => sortBy('az')} text="Newest" />
              <MenuOption onSelect={() => sortBy('za')} text="Oldest" />
              {/* <MenuOption
                // onSelect={() => handleChange(`mode`, 'month')}
                text="Increasing"
              />
              <MenuOption
                // onSelect={() => handleChange(`mode`, 'month')}
                text="Decreasing"
              /> */}
            </MenuOptions>
          </Menu>
          <Button
            backgroundColor={Colors.BUTTON_BG1}
            icon={'filter'}
            onPress={() => handleChange('visible', true)}
            style={{ height: 40, width: '48%', marginTop: 0 }}
            iconStyle={{ height: 18, width: 18 }}
            title={'Filter'}
          />
        </View>
        {title === 'Schedule Variances' && (
          <View style={{ width: '90%', marginBottom: 20, marginTop: 20 }}>
            <Text style={styles.description}>{'Totals'}</Text>
            <Text style={styles.title}>{'Actual Shift Duration:'}</Text>
            <Text style={styles.title}>{'Scheduled Shift Duration:'}</Text>
            <Text style={styles.title}>{'Variance:'}</Text>
          </View>
        )}
        {reportsFiltered?.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: Colors.TEXT_INPUT_BG,
              padding: 10,
              width: '90%',
              marginTop: 10,
              marginBottom: 10,
              borderRadius: 10
            }}
          >
            <View style={{ marginVertical: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between'
                }}
              >
                {title === 'Schedule Variances' ? (
                  <Text style={styles.description}>{'Late Clock in'}</Text>
                ) : (
                  <View />
                )}
                <Text style={[styles.description, { marginTop: 0 }]}>
                  {(item?.created_at || item?.updated_at) &&
                    moment
                      .utc(item?.updated_at || item?.created_at)
                      .local()
                      .fromNow()}
                </Text>
              </View>
              <Text
                style={[
                  styles.title,
                  { marginTop: title === 'Schedule Variances' ? 0 : -20 }
                ]}
              >
                {title === 'Inspection' ? 'Worksite' : 'Employee Name:'}
              </Text>
              <Text style={styles.description}>
                {title === 'Location Variances' ||
                title === 'Schedule Variances'
                  ? item?.employee
                  : title === 'Inspection'
                  ? item?.worksite?.name
                  : item?.employee?.name}
              </Text>
            </View>
            {title === 'Schedule Variances' && (
              <>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Worksite:'}</Text>
                  <Text style={styles.description}>{item?.worksite}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Actual Time:'}</Text>
                  <Text style={styles.description}>{item?.actual_time}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Edited Time:'}</Text>
                  <Text style={styles.description}>{item?.edited_time}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Actual Shift Duration:'}</Text>
                  <Text style={styles.description}>
                    {toHoursAndMinutes(item?.actual_shift_duration)}
                  </Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>
                    {'Scheduled Shift Duration:'}
                  </Text>
                  <Text style={styles.description}>
                    {toHoursAndMinutes(item?.scheduled_shift_duration)}
                  </Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Variance:'}</Text>
                  <Text style={styles.description}>{item?.variance}</Text>
                </View>
              </>
            )}
            {title === 'Location Variances' && (
              <>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Worksite:'}</Text>
                  <Text style={styles.description}>{item?.worksite}</Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Actual Time:'}</Text>
                  <Text style={styles.description}>
                    {moment
                      .utc(item?.actual_time)
                      .local()
                      .format('YYYY/MM/DD hh:mm')}
                  </Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Actual Location:'}</Text>
                  <Text style={styles.description}>
                    {item?.actual_location}
                    <Text style={styles.title}> - Map</Text>
                  </Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Worksite Location:'}</Text>
                  <Text style={styles.description}>
                    {item?.worksite_location}
                    <Text style={styles.title}> - Map</Text>
                  </Text>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <Text style={styles.title}>{'Distance Deviation:'}</Text>
                  <Text style={styles.description}>
                    {Number(item?.distance_deviation).toFixed(2)}Miles
                    <Text style={styles.title}> - Map</Text>
                  </Text>
                </View>
              </>
            )}
            {title !== 'Schedule Variances' && title !== 'Location Variances' && (
              <>
                <View style={{ marginVertical: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View>
                      <Text style={styles.title}>
                        {title === 'Inspection'
                          ? 'Inspection Report Name:'
                          : 'Total Hours:'}
                      </Text>
                      {
                        <Text style={styles.description}>
                          {title === 'Inspection'
                            ? item?.name
                            : item?.total_hours}
                        </Text>
                      }
                    </View>
                    {title === 'Inspection' && (
                      <>
                        {(Number(item?.stats?.SATISFACTORY) > 0 ||
                          Number(item?.stats?.NEEDS_ATTENTION) > 0 ||
                          Number(item?.stats?.UNSATISFACTORY) > 0) && (
                          <PieChart
                            widthAndHeight={90}
                            doughnut={true}
                            coverRadius={0.7}
                            series={[
                              item?.stats?.SATISFACTORY
                                ? Number(item?.stats?.SATISFACTORY)
                                : 0,
                              item?.stats?.NEEDS_ATTENTION
                                ? Number(item?.stats?.NEEDS_ATTENTION)
                                : 0,
                              item?.stats?.UNSATISFACTORY
                                ? Number(item?.stats?.UNSATISFACTORY)
                                : 0
                            ]}
                            sliceColor={sliceColor}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
                <View style={{ marginVertical: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View>
                      <Text style={styles.title}>
                        {title === 'Inspection'
                          ? 'Inspector'
                          : 'Total Compensation:'}
                      </Text>
                      <Text style={styles.description}>
                        {title === 'Inspection'
                          ? item?.inspector
                          : '$' + item?.earnings}
                      </Text>
                    </View>
                    {title === 'Inspection' && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('InspectionDetails', { item })
                        }
                      >
                        <Text
                          style={{
                            ...Fonts.poppinsRegular(14),
                            color: Colors.BLUR_TEXT
                          }}
                        >
                          {'See Report'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>
      <Modal
        visible={visible}
        transparent
        onDismiss={handleClose}
        onRequestClose={handleClose}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={handleClose}>
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.description, { ...Fonts.poppinsRegular(18) }]}>
              Filter
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ width: '50%' }}>
                <PrimaryTextInput
                  dateType={true}
                  text={from}
                  maxDate={new Date('2050/01/01')}
                  label="From"
                  key="from"
                  placeholder="From"
                  onChangeText={(text, isValid) => handleChange('from', text)}
                />
              </View>
              <View style={{ width: '50%' }}>
                <PrimaryTextInput
                  dateType={true}
                  maxDate={new Date('2050/01/01')}
                  text={to}
                  label="To"
                  key="to"
                  placeholder="To"
                  onChangeText={(text, isValid) => handleChange('to', text)}
                />
              </View>
            </View>
            <Button
              style={{ height: 40, marginTop: 20, width: '95%' }}
              onPress={_getReportsByFilter}
              disabled={!from || !to}
              // loading={loadingFeedback}
              title={'Apply filter'}
            />
            <Button
              style={{ height: 40 }}
              onPress={handleClose}
              isWhiteBg
              color={Colors.GREEN_COLOR}
              backgroundColor={'transparent'}
              title={'Cancel'}
            />
          </View>
        </View>
      </Modal>
      {title === 'Inspection' && (
        <Fab onPress={() => navigation.navigate('CreateInspection')} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },

  title: {
    ...Fonts.poppinsRegular(12),
    color: Colors.HOME_DES
  },
  childContainer: {
    flex: 1,
    padding: 20
  },
  footerButton: {
    marginTop: '15%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 2
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
