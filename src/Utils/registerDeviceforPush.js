import AsyncStorage from '@react-native-async-storage/async-storage'
import { readDevice } from '../api/auth'
import { Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging'

async function registerAppWithFCM() {
  const fcmenabled = await AsyncStorage.getItem('fcmenabled')
  const fcmtoken = await AsyncStorage.getItem('fcmtoken')
  if (fcmenabled != '' && !fcmtoken) {
    console.log(typeof fcmtoken)
    const getToken = await messaging().getToken()
    await AsyncStorage.setItem('fcmtoken', getToken)
    const token = await AsyncStorage.getItem('token')
    const user = await AsyncStorage.getItem('user')
    const userData = JSON.parse(user)
    // console.warn("getToken", getToken)
    const payloadRead = {
      device_id: getToken, // Send if you can otherwise remove field
      registration_id: getToken,
      active: true,
      name: userData?.first_name,
      type: Platform.OS
    }
    if (token && user) {
      readDevice(payloadRead, token)
    }
  }
}

export default registerAppWithFCM
