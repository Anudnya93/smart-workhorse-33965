import React, { useContext, useEffect } from 'react'
import {
  View,
  Platform,
  PermissionsAndroid,
  Text,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native'
import { BaseScene, Button } from '../Common'
import { Fonts, Colors, Images, Strings } from '../../res'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getUpcomingShift, newAttendance } from '../../api/employee'
import Toast from 'react-native-simple-toast'
import { useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import AppContext from '../../Utils/Context'
import { FlatList } from 'react-native'
import userProfile from '../../res/Images/common/sample.png'
import { ScrollView } from 'react-native'
import Header from '../Common/Header'
import Geolocation from '@react-native-community/geolocation'
import Geocoder from 'react-native-geocoding'
import moment from 'moment-timezone'

Geocoder.init('AIzaSyCndwU13bTZ8w_yhP4ErbFGE1Wr9oiro8Q')
const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
let LATITUDE_DELTA = 0.0922
let LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export default function ShiftDetails({ navigation }) {
  const { _getUpcomingShift, upcomingShiftData } = useContext(AppContext)
  const [state, setState] = useState({
    loading: false,
    visible: false,
    currentLocation: null,
    currentLocationName: ''
  })

  const { loading, visible, currentLocation, currentLocationName } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      requestGeolocationPermission()
    }, [])
  )

  async function requestGeolocationPermission() {
    try {
      if (Platform.OS === 'ios') {
        getCurrentLocation()
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'CleanR Geolocation Permission',
          message: 'CleanR needs access to your current location.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation()
      } else {
        console.log('Geolocation permission denied')
      }
    } catch (err) {}
  }

  const getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        var lat = parseFloat(position.coords.latitude)
        var long = parseFloat(position.coords.longitude)
        const region = {
          latitude: lat,
          longitude: long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        }
        handleChange('currentLocation', region)
        Geocoder.from(lat, long)
          .then(json => {
            var addressComponent = json.results[0].address_components[0]
            console.log(addressComponent)
            handleChange('currentLocationName', addressComponent.short_name)
          })
          .catch(error => console.warn(error))
      },
      error => console.log('Error', JSON.stringify(error))
      // Platform.OS !== "android" && {
      //   enableHighAccuracy: true,
      //   timeout: 20000,
      //   maximumAge: 1000
      // }
    )
    Geolocation.watchPosition(
      position => {
        var lat = parseFloat(position.coords.latitude)
        var long = parseFloat(position.coords.longitude)
        const region = {
          latitude: lat,
          longitude: long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        }
        handleChange('currentLocation', region)
        Geocoder.from(lat, long)
          .then(json => {
            var addressComponent = json.results[0].address_components[0]
            handleChange('currentLocationName', addressComponent.short_name)
          })
          .catch(error => console.warn(error))
      },
      error => console.log('Error', JSON.stringify(error)),
      Platform.OS !== 'android' && {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    )
  }

  useFocusEffect(
    useCallback(() => {
      _getUpcomingShift()
      getCurrentLocation()
    }, [])
  )

  const _newAttendance = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        event: upcomingShiftData?.id,
        status: 'CLOCK_IN',
        location: currentLocationName,
        latitude: Number(currentLocation?.latitude).toFixed(6),
        longitude: Number(currentLocation?.longitude).toFixed(6)
      }
      await newAttendance(payload, token)
      handleChange('loading', false)
      _getUpcomingShift()
      navigation.goBack()
    } catch (error) {
      handleChange('loading', false)
      const showWError = Object.values(error.response?.data)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }
  const renderClockButton = () => {
    return (
      <Button
        onPress={_newAttendance}
        loading={loading}
        disabled={!currentLocation?.latitude || !currentLocation?.longitude}
        title={Strings.clockIn}
        style={{
          marginVertical: 30
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Header
        title={'Clock In'}
        leftButton
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView style={{ paddingHorizontal: '5%' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <View style={{ width: '100%' }}>
            <Image
              source={{ uri: upcomingShiftData?.logo }}
              style={styles.image}
            />
            <Text
              style={[
                styles.description,
                { fontSize: 14, color: Colors.HOME_DES }
              ]}
            >
              Worksite name:
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, marginTop: 0, color: Colors.BLACK }
              ]}
            >
              {upcomingShiftData?.worksite?.name}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, color: Colors.HOME_DES }
              ]}
            >
              Location:
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, marginTop: 0, color: Colors.BLACK }
              ]}
            >
              {upcomingShiftData?.worksite?.location}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, color: Colors.HOME_DES }
              ]}
            >
              Scheduled Shift:
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, marginTop: 0, color: Colors.BLACK }
              ]}
            >
              {moment
                .utc(upcomingShiftData?.schedule_shift_start_time)
                .local()
                .format('hh:mm A')}{' '}
              to{' '}
              {moment
                .utc(upcomingShiftData?.schedule_shift_end_time)
                .local()
                .format('hh:mm A')}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, color: Colors.HOME_DES }
              ]}
            >
              Worksite Notes:
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, marginTop: 0, color: Colors.BLACK }
              ]}
            >
              {upcomingShiftData?.worksite?.notes}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, color: Colors.HOME_DES }
              ]}
            >
              Worksite Instructions:
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 14, marginTop: 0, color: Colors.BUTTON_BG }
              ]}
            >
              {upcomingShiftData?.worksite?.instruction_video}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { marginTop: 20 }]}>{'Tasks'}</Text>
        {upcomingShiftData?.worksite?.tasks?.map((task, index) => (
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
            <Text style={styles.inputText}>{task?.name}</Text>
          </View>
        ))}
        <Text style={[styles.title, { marginTop: 20 }]}>
          {'Assigned Employees'}
        </Text>
        <FlatList
          data={upcomingShiftData?.assigned_employees}
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
                  item?.profile_image
                    ? { uri: item?.profile_image }
                    : userProfile
                }
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  marginRight: 20
                }}
              />
              <View>
                <Text style={{ ...Fonts.poppinsRegular(12) }}>
                  {item?.name}
                </Text>
                <Text
                  style={{
                    ...Fonts.poppinsRegular(12),
                    color: Colors.BLUR_TEXT
                  }}
                >
                  Phone Number: {item?.mobile}
                </Text>
              </View>
            </View>
          )}
        />
        {renderClockButton()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%'
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
  image: {
    // tintColor: Colors.BUTTON_BG,
    resizeMode: 'cover',
    width: 100,
    height: 100,
    marginTop: 20
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
