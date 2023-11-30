import React, { useEffect, useState } from 'react'
import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { AuthNavigator } from './src/Navigation/AppNavigation'
import SplashScreen from 'react-native-splash-screen'
import './src/protos'
import AppContext from './src/Utils/Context'
import { MenuProvider } from 'react-native-popup-menu'
import {
  getAllSchedules,
  getEarnings,
  getleaveRequest
} from './src/api/business'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import {
  getAllNotifications,
  getCities,
  getCountries,
  getProfile,
  getStates,
  readDevice
} from './src/api/auth'
import { getUpcomingShift, getUpcomingShiftTimes } from './src/api/employee'
import { SafeAreaView, View } from 'react-native'
import Colors from './src/res/Theme/Colors'
import PushNotification from 'react-native-push-notification'

let timeout

const checkError = error => {
  const showWError = error.response?.data?.error
    ? error.response?.data?.error
    : error.response?.data
    ? Object.values(error.response?.data)
    : ''

  if (error?.response?.data?.error?.['start time & end time']) {
    Toast.show(`Error: ${error?.response?.data['start time & end time']}`)
  } else if (showWError.length > 0) {
    if (showWError.includes('not active')) {
      Toast.show(
        'Please visit https://www.cleanr.pro to finalize your business subscription - most functionality will be limited until then'
      )
    } else {
      Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
    }
  } else {
    Toast.show(`Error: ${JSON.stringify(error)}`)
  }
}

const App = () => {
  const [user, setUser] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [earnings, setEarnings] = useState([])
  const [earningLoading, setEarningLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [leaveRequest, setLeaveRequest] = useState([])
  const [loadingCity, setLoadingCity] = useState(false)
  const [upcomingShiftData, setUpcomingShiftData] = useState(null)
  const [upcomingShiftTimesDataList, setupcomingShiftTimesDataList] = useState(
    []
  )
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
    }, 2000)
  })

  const _getCountries = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const countries = await getCountries(token)
      _getCities('')
      const states = await getStates(token)
      setCountries(countries?.data?.results)
      setCities(cities?.data)
      setStates(states?.data?.results)
    } catch (error) {
      checkError(error)
    }
  }

  const gettingCities = async payload => {
    setLoadingCity(true)
    const body = payload || ''
    const token = await AsyncStorage.getItem('token')
    const cities = await getCities(body, token)
    console.log({ data: cities.data })
    setCities(cities?.data)
    setLoadingCity(false)
  }

  const _getCities = async payload => {
    try {
      if (timeout) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          gettingCities(payload)
        }, 300)
      } else {
        timeout = setTimeout(() => {
          gettingCities(payload)
        }, 300)
      }
    } catch (error) {
      setLoadingCity(false)
      checkError(error)
    }
  }

  const _getAllSchedules = async payload => {
    try {
      const token = await AsyncStorage.getItem('token')
      const qs = payload || ''
      const res = await getAllSchedules(qs, token)
      // console.log({ schedules: res })
      setSchedules(res?.data?.response)
    } catch (error) {
      console.log(error)
      checkError(error)
    }
  }

  const _getEarnings = async payload => {
    try {
      setEarningLoading(true)
      const qs = payload ? payload : ''
      const token = await AsyncStorage.getItem('token')
      const res = await getEarnings(qs, token)
      setEarnings(res?.data)
      setEarningLoading(false)
    } catch (error) {
      console.log(error)
      setEarningLoading(false)
      checkError(error)
    }
  }

  const _getleaveRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await getleaveRequest(token)
      console.log('getleaveRequest', res?.data?.results)
      setLeaveRequest(res?.data?.results)
    } catch (error) {
      checkError(error)
    }
  }

  const _getProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await getProfile(token)
      setAdminProfile(res?.data?.response)
    } catch (error) {
      checkError(error)
    }
  }

  const _getUpcomingShift = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await getUpcomingShift(token)
      setUpcomingShiftData(res?.data)
      console.warn('res?.data?.id', res?.data?.id)
      if (res?.data?.id) {
        const res1 = await getUpcomingShiftTimes(
          `?event=${res?.data?.id}`,
          token
        )
        setupcomingShiftTimesDataList(res1?.data)
      }
    } catch (error) {
      checkError(error)
    }
  }

  const _readDevice = async payload => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await readDevice(payload, token)
    } catch (error) {
      checkError(error)
    }
  }

  const _getNotification = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const res = await getAllNotifications(token)
      setNotifications(res?.data?.results)
    } catch (error) {
      checkError(error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        adminProfile,
        setAdminProfile,
        schedules,
        _getAllSchedules,
        _getCountries,
        countries,
        cities,
        states,
        earnings,
        _getEarnings,
        _getProfile,
        leaveRequest,
        _getleaveRequest,
        _getUpcomingShift,
        upcomingShiftData,
        _readDevice,
        notifications,
        _getNotification,
        earningLoading,
        _getCities,
        loadingCity,
        upcomingShiftTimesDataList
      }}
    >
      <MenuProvider>
        <NavigationContainer>
          <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND_BG }}>
            <SafeAreaView style={{ flex: 1 }}>
              <AuthNavigator />
            </SafeAreaView>
          </View>
        </NavigationContainer>
      </MenuProvider>
    </AppContext.Provider>
  )
}

export default App

export { checkError }
