import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import Toast from 'react-native-simple-toast'
import { getAllEmployee } from '../../api/business'
import { Fonts, Colors } from '../../res'
import Sample from '../../res/Images/common/sample.png'
import Button from '../Common/Button'
import { Switch } from 'react-native-switch'
import AppContext from '../../Utils/Context'
import moment from 'moment-timezone'
import { Modal } from 'react-native'
import { Icon } from 'react-native-elements'
import Strings from '../../res/Strings'
import PrimaryTextInput from '../Common/PrimaryTextInput'
import { currencyFormatIntl } from '../../Utils/number'
import { MultiSelect } from 'react-native-element-dropdown'
import { Platform } from 'react-native'

export default function EmployeeListScene({ navigation }) {
  const { earnings, earningLoading, _getEarnings } = useContext(AppContext)
  const [state, setState] = useState({
    loading: false,
    isDisplay: true,
    allEmployee: [],
    visible: false,
    name: '',
    startDate: null,
    endDate: null
  })
  const [selected, setSelected] = useState([])
  const { loading, visible, isDisplay, name, startDate, endDate, allEmployee } =
    state

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  useEffect(() => {
    _getAllEmployee()
  }, [])

  const _getAllEmployee = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await getAllEmployee(token)
      handleChange(
        'allEmployee',
        res?.data?.results
          .map(item => ({
            name:
              item.personal_information.first_name +
              ' ' +
              item.personal_information.last_name,
            id: item?.id
          }))
          .map(item => {
            return {
              ...item,
              label: item.name,
              value: item.name
            }
          })
          .sort((a, b) => a.label.localeCompare(b.label))
      )
    } catch (error) {
      console.log({ error })
    }
  }

  // console.log({ allEmployee })

  useFocusEffect(
    useCallback(() => {
      _getEarnings('')
    }, [])
  )

  const hideModal = () => {
    handleChange('selectedEvent', null)
    handleChange('visible', false)
  }

  const handleApplyFilter = () => {
    const empstring =
      selected.length > 0
        ? (() => {
            let ids = ''
            selected.forEach(selection => {
              const emp = allEmployee.find(item => item.name == selection)
              if (emp) {
                ids += `&employee=${emp.id}`
              }
            })
            return ids
          })()
        : ''
    let string = ''
    if (empstring && startDate && endDate) {
      string =
        `?from=${moment(startDate, 'MM/DD/YYYY').format(
          'YYYY-MM-DD'
        )}&to=${moment(endDate, 'MM/DD/YYYY').format('YYYY-MM-DD')}` + empstring
    } else if (empstring) {
      string = '?' + empstring.slice(1)
    } else if (startDate && endDate) {
      string = `?from=${moment(startDate, 'MM/DD/YYYY').format(
        'YYYY-MM-DD'
      )}&to=${moment(endDate, 'MM/DD/YYYY').format('YYYY-MM-DD')}`
    }
    _getEarnings(string)
    hideModal()
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 20
        }}
      >
        <View>
          <Text style={styles.title1}>
            {`Payroll hours: ${earnings?.payroll_hours || 0} h`}
          </Text>
          <Text style={styles.dateText}>
            {moment(earnings?.date).format('DD MMMM, YYYY')}
          </Text>
        </View>
        <Button
          backgroundColor={Colors.BUTTON_BG1}
          icon={'filter'}
          onPress={() => handleChange('visible', true)}
          iconStyle={{ height: 18, width: 18 }}
          style={{ height: 40, width: 100, marginTop: 0 }}
          title={'Filter'}
        />
      </View>
      <View
        style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}
      >
        <Text style={styles.displayText}>Display earnings</Text>
        <Switch
          value={isDisplay}
          onValueChange={val => handleChange('isDisplay', val)}
          disabled={false}
          activeText={'On'}
          inActiveText={'Off'}
          circleSize={20}
          barHeight={24}
          circleBorderWidth={0}
          backgroundActive={'#14C771'}
          backgroundInactive={'#CCCCCC'}
          circleActiveColor={'#fff'}
          circleInActiveColor={'#fff'}
          changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
          innerCircleStyle={{ alignItems: 'center', justifyContent: 'center' }} // style for inner animated circle for what you (may) be rendering inside the circle
          outerCircleStyle={{ padding: 3 }} // style for outer animated circle
          renderActiveText={false}
          containerStyle={{ marginLeft: 10 }}
          renderInActiveText={false}
          switchLeftPx={2.1} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
          switchRightPx={2.1} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
          switchWidthMultiplier={2.2} // multiplied by the `circleSize` prop to calculate total width of the Switch
          switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
        />
      </View>
      {earnings?.employees?.length > 0 && (
        <Text style={styles.hourly}>Hours Earnings</Text>
      )}
      {earningLoading && (
        <View style={{ marginBottom: 10, width: '100%', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.BACKGROUND_BG} size={'small'} />
        </View>
      )}
      <FlatList
        style={{ width: '100%' }}
        data={earnings?.employees}
        renderItem={({ item, index }) => (
          <View style={styles.listContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={
                  item?.employee_image ? { uri: item?.employee_image } : Sample
                }
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 5,
                  marginRight: 10
                }}
              />
              <View>
                <Text style={styles.title}>{item?.employee_name}</Text>
                <Text style={styles.job}>{item?.employee_position}</Text>
                <Text
                  style={styles.location}
                >{`Hourly rate: ${currencyFormatIntl(
                  item?.employee_hourly_rate
                )}/hr`}</Text>
              </View>
            </View>
            <View
              style={{
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <Text style={[styles.title, { marginRight: 20 }]}>
                  {item?.employee_hours + 'h'}
                </Text>
                <Text style={styles.title}>
                  {!isDisplay
                    ? 'N/A'
                    : currencyFormatIntl(item?.employee_earnings)}
                </Text>
              </View>
              {/* <Text style={styles.message}>View Details</Text> */}
            </View>
          </View>
        )}
      />
      <Modal
        visible={visible}
        transparent
        onDismiss={hideModal}
        onRequestClose={hideModal}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  setSelected([])
                  handleChange('startDate', null)
                  handleChange('endDate', null)
                  hideModal()
                }}
              >
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <Text style={styles.titleHead}>{'Filter Payroll'}</Text>
            <MultiSelect
              maxHeight={200}
              dropdownPosition="bottom"
              style={styles.dropdownStyle}
              placeholderStyle={[
                styles.placeholderStyle,
                selected.length > 0 && {
                  color: Colors.TEXT_COLOR
                }
              ]}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={{ marginTop: Platform.OS == 'android' ? -22 : 0 }}
              fontFamily="Poppins-Regular"
              data={allEmployee}
              labelField="label"
              valueField="value"
              placeholder={
                selected.length > 0 ? selected.join(', ') : 'Select employees'
              }
              value={selected}
              onChange={item => {
                setSelected(item)
              }}
              visibleSelectedItem={false}
              itemTextStyle={styles.selectedTextStyle}
            />
            <PrimaryTextInput
              inputStyle={{ marginTop: 5 }}
              text={startDate}
              dateType={true}
              key="startdate"
              label="Choose start date"
              onChangeText={(text, isValid) => handleChange('startDate', text)}
            />
            <PrimaryTextInput
              disabled={!startDate}
              minDate={startDate}
              text={endDate}
              dateType={true}
              key="enddate"
              label="Choose end date"
              onChangeText={(text, isValid) => handleChange('endDate', text)}
            />
            <Button
              style={[styles.footerWhiteButton]}
              onPress={handleApplyFilter}
              title={'Apply filter'}
              color={Colors.BUTTON_BG}
              disabled={startDate && !endDate}
            />
            <Button
              style={[styles.footerWhiteButton, { borderWidth: 0 }]}
              onPress={() => {
                _getEarnings('')
                setSelected([])
                handleChange('startDate', null)
                handleChange('endDate', null)
                hideModal()
              }}
              isWhiteBg
              title={'Reset'}
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
    backgroundColor: Colors.WHITE
  },
  listContainer: {
    backgroundColor: Colors.TEXT_INPUT_BG,
    width: '100%',
    height: 70,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR
  },
  titleHead: {
    ...Fonts.poppinsRegular(18),
    color: Colors.TEXT_COLOR,
    marginBottom: 10
  },
  title1: {
    ...Fonts.poppinsRegular(16),
    color: Colors.TEXT_COLOR
  },
  location: {
    ...Fonts.poppinsRegular(12),
    color: Colors.TEXT_COLOR
  },
  job: {
    ...Fonts.poppinsRegular(12),
    color: Colors.BLUR_TEXT
  },
  hourly: {
    ...Fonts.poppinsRegular(13),
    textTransform: 'uppercase',
    textAlign: 'right',
    width: '100%',
    marginBottom: 10,
    color: Colors.BLUR_TEXT
  },
  dateText: {
    ...Fonts.poppinsRegular(13),
    color: Colors.BLUR_TEXT
  },
  displayText: {
    ...Fonts.poppinsRegular(13),
    color: Colors.TEXT_COLOR
  },
  message: {
    ...Fonts.poppinsRegular(13),
    color: Colors.BLUR_TEXT
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
    marginTop: 20,
    lineHeight: 24
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
  },
  selectedTextStyle: {
    ...Fonts.poppinsRegular(14)
  },
  placeholderStyle: {
    ...Fonts.poppinsRegular(14),
    color: Colors.HOME_DES,
    maxHeight: 20,
    lineHeight: 20
  },
  dropdown: {
    backgroundColor: Colors.HOME_DES
  },
  dropdownStyle: {
    width: '90%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER
  }
})
