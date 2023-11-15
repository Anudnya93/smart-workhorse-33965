import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import Toast from 'react-native-simple-toast'
import { getAllEmployee } from '../../api/business'
import { Fonts, Colors } from '../../res'
import Sample from '../../res/Images/common/sample.png'
import { currencyFormatIntl } from '../../Utils/number'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'

export default function EmployeeListScene({ navigation, callback }) {
  const [state, setState] = useState({
    loading: false,
    allEmployee: [],
    ApiCalled: false
  })
  const { loading, allEmployee, ApiCalled } = state

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      _getAllEmployee()
    }, [])
  )

  useEffect(() => {
    if (allEmployee.length > 0) {
      callback()
    }
  }, [allEmployee])
  const _getAllEmployee = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await getAllEmployee(token)
      handleChange('loading', false)
      handleChange('ApiCalled', true)
      handleChange('allEmployee', res?.data?.results)
    } catch (error) {
      handleChange('loading', false)
      handleChange('ApiCalled', true)
      Toast.show(
        `Error: ${error.response?.data[Object.keys(error.response?.data)[0]]}`
      )
    }
  }
  return (
    <View style={styles.container}>
      {state.allEmployee.length > 0 && (
        <Text style={styles.hourly}>Hourly rate</Text>
      )}
      {loading && (
        <View style={{ marginBottom: 10, width: '100%', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.BACKGROUND_BG} size={'small'} />
        </View>
      )}
      {ApiCalled && (
        <FlatList
          scrollEnabled={false}
          style={{ width: '100%' }}
          data={allEmployee}
          ListEmptyComponent={() => (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: hp(70)
              }}
            >
              <Text style={styles.noEmp}>No Employees Found!</Text>
              <Text style={styles.desc}>
                {
                  'You currently have no employees..\nAdd employees by clicking below.'
                }
              </Text>
              <TouchableOpacity
                style={styles.Add}
                onPress={() => {
                  navigation.navigate('addEmployee')
                }}
              >
                <Text
                  style={{ color: Colors.WHITE, ...Fonts.poppinsMedium(16) }}
                >
                  Add an employee
                </Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('employeesView', { item })}
              style={styles.listContainer}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={
                    item?.personal_information?.profile_image
                      ? { uri: item?.personal_information?.profile_image }
                      : Sample
                  }
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 5,
                    marginRight: 10
                  }}
                />
                <View>
                  <Text style={styles.title}>
                    {item?.personal_information?.first_name +
                      ' ' +
                      item?.personal_information?.last_name}
                  </Text>
                  <Text style={styles.job}>
                    {item?.work_information?.position}
                  </Text>
                  <Text style={styles.location}>
                    {(item?.address_information?.address_line_one
                      ? item?.address_information?.address_line_one
                      : '') +
                      ' ' +
                      (item?.address_information?.address_line_two
                        ? item?.address_information?.address_line_two
                        : '')}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <Text style={styles.title}>
                  {currencyFormatIntl(item?.work_information?.hourly_rate)}/hr
                </Text>
                <Text style={styles.message}>Message</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    height: '100%'
  },
  listContainer: {
    backgroundColor: Colors.TEXT_INPUT_BG,
    width: '100%',
    height: 70,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    ...Fonts.poppinsRegular(14),
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
  Add: {
    backgroundColor: Colors.BACKGROUND_BG,
    padding: 10,
    width: '80%',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: hp(5)
  },
  noEmp: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR,
    marginTop: hp(25),
    marginBottom: hp(3)
  },
  desc: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    lineHeight: 24
  }
})
