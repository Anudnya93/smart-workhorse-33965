import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Linking
} from 'react-native'
import { Header } from '../Common'
import { Colors, Fonts } from '../../res'
import Strings from '../../res/Strings'
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import Geocoder from 'react-native-geocoding'
import haversine from 'haversine'
import { useFocusEffect } from '@react-navigation/native'
import { GEOCODE } from '../../../env'

Geocoder.init(GEOCODE)

const { width, height } = Dimensions.get('window')
const mapStyle = [
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  }
]
const ASPECT_RATIO = width / height
let LATITUDE_DELTA = 0.0922
let LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export default function WorksiteMapScene({ navigation, route }) {
  const worksiteData = route?.params?.item
  // Geolocation.setRNConfiguration({
  //   skipPermissionRequests: false
  // })
  console.log({ worksiteData })
  var mapRef = useRef(null)
  const [state, setState] = useState({
    loading: false,
    pinLocation: null
  })

  const { currentLocation, pinLocation } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      requestGeolocationPermission()
    }, [])
  )
  useEffect(() => {
    requestGeolocationPermission()
  }, [])

  useEffect(() => {
    Geocoder.from(worksiteData?.location)
      .then(json => {
        var addressComponent = json.results[0].geometry.location
        console.log(addressComponent)
        handleChange('pinLocation', {
          latitude: addressComponent.lat,
          longitude: addressComponent.lng
        })

        mapRef &&
          mapRef?.current?.animateToRegion({
            latitude: addressComponent.lat,
            longitude: addressComponent.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          })
      })
      .catch(error => console.warn(error))
  }, [worksiteData])

  const calcDistance = () => {
    return (
      (pinLocation &&
        currentLocation &&
        haversine(pinLocation, currentLocation)) ||
      0
    )
  }

  async function requestGeolocationPermission() {
    try {
      if (Platform.OS === 'ios') {
        getCurrentLocation()
        return
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
    } catch (err) {
      console.warn(err)
    }
  }

  const getCurrentLocation = async () => {
    // geolocation.requestAuthorization();
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
        console.log({ region })
        handleChange('currentLocation', region)
        // mapRef && mapRef?.current?.animateToRegion(region)
      },
      error => console.log('Error', JSON.stringify(error)),
      Platform.OS !== 'ios' && {
        enableHighAccuracy: Platform.OS === 'ios' ? false : true,
        timeout: 20000,
        maximumAge: 1000
      }
    )
    Geolocation.watchPosition(position => {
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)
      const region = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      setState(pre => ({ ...pre, currentLocation: region }))
      // mapRef && mapRef?.current?.animateToRegion(region)
    })
  }

  const openMap = () => {
    const latitude = pinLocation?.latitude || '40.7127753'
    const longitude = pinLocation?.longitude || '-74.0059728'
    const label = worksiteData?.location || 'New York, NY, USA'

    const url = Platform.select({
      ios: 'maps:' + latitude + ',' + longitude + '?q=' + label,
      android: 'geo:' + latitude + ',' + longitude + '?q=' + label
    })

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url)
      } else {
        const browser_url =
          'https://www.google.de/maps/@' +
          latitude +
          ',' +
          longitude +
          '?q=' +
          label
        return Linking.openURL(browser_url)
      }
    })
  }

  return (
    <View style={styles.container}>
      <Header
        onLeftPress={() => navigation.goBack()}
        title={Strings.worksites}
        leftButton
      />
      <View style={{ width: '100%', height: '100%' }}>
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={
            pinLocation
              ? {
                  ...pinLocation,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA
                }
              : currentLocation
          }
          // onPress={props => onMapPress(props.nativeEvent.coordinate)}
          onRegionChange={() => console.log('')}
          ref={mapRef}
        >
          {pinLocation && (
            <Marker
              title={'Worksite Location'}
              style={{ alignItems: 'center' }}
              // onPress={() => handleClickFood(truck)}
              coordinate={pinLocation}
            />
          )}
          {currentLocation && (
            <Marker
              title={'My Location'}
              style={{ alignItems: 'center' }}
              // onPress={() => handleClickFood(truck)}
              coordinate={currentLocation}
            />
          )}
          {pinLocation && currentLocation && (
            <Polyline
              strokeColor={Colors.BUTTON_BG}
              strokeWidth={2}
              // onPress={() => handleClickFood(truck)}
              coordinates={[pinLocation, currentLocation]}
            />
          )}
        </MapView>
      </View>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 0,
          padding: 20,
          backgroundColor: '#fff'
        }}
      >
        <Text style={{ ...Fonts.poppinsRegular(14), color: Colors.BLUR_TEXT }}>
          Worksite Location:{' '}
          <Text style={{ color: Colors.TEXT_COLOR }}>
            {worksiteData?.location}
          </Text>
        </Text>
        <Text
          style={{
            marginTop: 5,
            ...Fonts.poppinsRegular(14),
            color: Colors.BLUR_TEXT
          }}
        >
          Distance:{' '}
          <Text style={{ color: Colors.TEXT_COLOR }}>
            {calcDistance()?.toFixed(2) + ' mi'}
          </Text>
        </Text>
        <TouchableOpacity onPress={openMap} style={styles.navigate}>
          <Text style={{ color: 'white', ...Fonts.poppinsMedium(16) }}>
            Navigate
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    position: 'relative'
  },
  title: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR,
    marginBottom: 10,
    marginTop: 20
  },
  childContainer: {
    width: '90%'
  },
  footerButton: {
    marginTop: '5%',
    width: '100%'
  },
  footerWhiteButton: {
    marginTop: '5%',
    width: '100%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  },
  description: {
    ...Fonts.poppinsRegular(12),
    color: '#818080',
    textAlign: 'left',
    marginTop: 10
  },
  cellContainer: {
    marginVertical: 10,
    width: '100%'
  },
  cellTitle: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR
  },
  map: {
    height: '100%',
    ...StyleSheet.absoluteFillObject
  },
  navigate: {
    backgroundColor: Colors.BUTTON_BG,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  }
})
