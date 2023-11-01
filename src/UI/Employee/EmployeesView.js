import React, { useState, useContext } from 'react'
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native'
import { Fonts, Colors } from '../../res'
import Sample from '../../res/Images/common/sample.png'
import { Header, Button } from '../Common'
import moment from 'moment'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteEmployee } from '../../api/business'
import database from '@react-native-firebase/database'
import AppContext from '../../Utils/Context'
import { currencyFormatIntl } from '../../Utils/number'

export default function EmployeesView({ navigation, route }) {
  const item = route?.params?.item
  const { user } = useContext(AppContext)

  const [state, setState] = useState({
    loading: false
  })

  const { loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      const res = await deleteEmployee(item?.id, token)
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

  const createMessageList = item => {
    const id = `${user?.id}_${item?.id}`
    const rid = `${item?.id}_${user?.id}`
    const db = database()
    db.ref('Messages/' + id).once('value', snapshot => {
      if (snapshot.val()) {
        let value = {
          sender: user,
          senderId: user?.id,
          id: id,
          timeStamp: Date.now(),
          receiverRead: 0,
          receiverId: item.id,
          receiver: item
        }
        database()
          .ref('Messages/' + id)
          .update(value)
          .then(res => {
            navigation.navigate('MessageChat', { messageuid: id })
          })
          .catch(err => {
            Toast.show('Something went wrong!')
          })
      } else {
        db.ref('Messages/' + rid).once('value', snapshot => {
          if (snapshot.val()) {
            let value = {
              sender: user,
              senderId: user?.id,
              id: rid,
              timeStamp: Date.now(),
              receiverRead: 0,
              receiverId: item.id,
              receiver: item
            }
            database()
              .ref('Messages/' + rid)
              .update(value)
              .then(res => {
                navigation.navigate('MessageChat', { messageuid: rid })
              })
              .catch(err => {
                Toast.show('Something went wrong!')
              })
          } else {
            let value = {
              sender: user,
              senderId: user?.id,
              id: id,
              timeStamp: Date.now(),
              receiverRead: 0,
              receiverId: item.id,
              receiver: item
            }
            database()
              .ref('Messages/' + id)
              .update(value)
              .then(res => {
                navigation.navigate('MessageChat', { messageuid: id })
              })
              .catch(err => {
                Toast.show('Something went wrong!')
              })
          }
        })
      }
    })
  }

  return (
    <View style={styles.container}>
      <Header
        leftButton
        title={'View Employee'}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ width: '90%' }}
      >
        <Image
          source={
            item?.personal_information?.profile_image
              ? { uri: item?.personal_information?.profile_image }
              : Sample
          }
          style={styles.picture}
        />
        <Text style={styles.hourly}>
          {item?.personal_information?.first_name +
            ' ' +
            item?.personal_information?.last_name}
        </Text>
        <View style={styles.textView}>
          <Text style={styles.job}>Date of birth:</Text>
          <Text style={styles.title}>
            {moment(item?.personal_information?.date_of_birth).format(
              'MM/DD/YYYY'
            )}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Email Address:</Text>
          <Text style={styles.title}>{item?.contact?.email}</Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Phone Number:</Text>
          <Text style={styles.title}>{item?.contact?.phone}</Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Address:</Text>
          <Text style={styles.title}>
            {item?.address_information?.address_line_one}{' '}
            {item?.address_information?.address_line_two}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Position:</Text>
          <Text style={styles.title}>{item?.work_information?.position}</Text>
        </View>
        <View style={styles.textView}>
          <Text style={styles.job}>Hourly Rate:</Text>
          <Text style={styles.title}>
            {currencyFormatIntl(item?.work_information?.hourly_rate)}/hr
          </Text>
        </View>
        <Button
          style={[styles.footerWhiteButton]}
          title={'Message'}
          onPress={() => createMessageList(item)}
          icon={'messages'}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          isWhiteBg
          color={Colors.GREEN_COLOR}
        />
        <Button
          style={[styles.footerWhiteButton]}
          onPress={() => navigation.navigate('addEmployee', { item })}
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
        <Button
          style={[styles.footerWhiteButton, { marginBottom: 30 }]}
          title={'Delete Employee'}
          onPress={handleSubmit}
          loading={loading}
          icon={'delete'}
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
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  }
})
