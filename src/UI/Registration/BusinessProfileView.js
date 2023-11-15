import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image
} from 'react-native'
import { Fonts, Colors } from '../../res'
import Sample from '../../res/Images/common/sample.png'
import { Header, Button } from '../Common'
import moment from 'moment'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteEmployee } from '../../api/business'
import AppContext from '../../Utils/Context'
import { useContext } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

export default function BusinessProfileView({ navigation }) {
  const { _getCountries, cities, states, adminProfile } = useContext(AppContext)
  const [state, setState] = useState({
    loading: false
  })

  const { loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useFocusEffect(
    useCallback(() => {
      _getCountries()
    }, [])
  )

  const getCityTValue = (list, value) => {
    const filtered = list?.filter(e => e.id === value)
    return filtered?.length > 0 ? filtered[0]?.name : ''
  }

  const handleSubmit = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await deleteEmployee(adminProfile?.id, token)
      handleChange('loading', false)
      navigation.goBack()
      Toast.show('Employee has been deleted!')
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

  // console.warn('user', adminProfile)

  return (
    <View style={styles.container}>
      <Header
        leftButton
        title={'My Profile'}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ width: '90%' }}
      >
        <Image
          source={
            adminProfile?.business_information?.profile_image
              ? { uri: adminProfile?.business_information?.profile_image }
              : Sample
          }
          style={styles.picture}
        />
        <Text style={styles.hourly}>
          {adminProfile?.personal_information?.first_name}
        </Text>
        <Text style={styles.heading}>Business Information</Text>
        <View style={styles.textView}>
          <Text style={styles.job}>Business Name:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_information?.name}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Pay Frequency:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_information?.pay_frequency}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Business Code:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_information?.business_code}
          </Text>
        </View>
        <Text style={styles.heading}>Personal information</Text>
        <View style={styles.textView}>
          <Text style={styles.job}>First Name:</Text>
          <Text style={styles.title}>
            {adminProfile?.personal_information?.first_name}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Last Name:</Text>
          <Text style={styles.title}>
            {adminProfile?.personal_information?.last_name}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Mobile Number:</Text>
          <Text style={styles.title}>
            {adminProfile?.personal_information?.phone}{' '}
          </Text>
        </View>
        {/* <View style={styles.textView}>
          <Text style={styles.job}>Gender:</Text>
          <Text style={styles.title}>
            {adminProfile?.personal_information?.gender}
          </Text>
        </View> */}
        <View style={styles.textView}>
          <Text style={styles.job}>Date of Birth:</Text>
          <Text style={styles.title}>
            {moment(adminProfile?.personal_information?.date_of_birth).format(
              'MM/DD/YYYY'
            )}
          </Text>
        </View>
        <Text style={styles.heading}>Business Address</Text>
        <View style={styles.textView}>
          <Text style={styles.job}>Business Address:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_address?.address_line_one}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>City:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_address?.city_name}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>State:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_address?.state_name}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Zip Code:</Text>
          <Text style={styles.title}>
            {adminProfile?.business_address?.zipcode}
          </Text>
        </View>
        <Button
          style={[styles.footerWhiteButton]}
          onPress={() => navigation.navigate('businessProfileCreation')}
          title={'Edit'}
          icon={'edit'}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          isWhiteBg
          color={Colors.GREEN_COLOR}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  picture: {
    width: 100,
    marginTop: 20,
    height: 100,
    borderRadius: 10,
    marginBottom: 20
  },
  heading: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
    ...Fonts.poppinsRegular(20),
    color: Colors.TEXT_COLOR
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
    ...Fonts.poppinsRegular(16),
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
    color: Colors.TEXT_COLOR
  },
  message: {
    ...Fonts.poppinsRegular(13),
    color: Colors.BLUR_TEXT
  },
  textView: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20
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
  footerWhiteButton: {
    marginTop: '5%',
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  }
})
