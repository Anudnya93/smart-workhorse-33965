import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import NotificationIcon from '../../res/Images/common/notificationIcon.png'
import clock from '../../res/Images/common/clock.png'
import time from '../../res/Images/common/time.png'
import { Icon, CheckBox } from 'react-native-elements'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-simple-toast'
import { Images } from '../../res'
import { useFocusEffect } from '@react-navigation/native'
import AppContext from '../../Utils/Context'
import Header from '../Common/Header'
import { Fonts } from '../../res/Theme'
import Colors from '../../res/Theme/Colors'
import { readNotification } from '../../api/auth'
import FastImage from 'react-native-fast-image'
import IconCom from '../Common/Icon'

const Notifications = ({ navigation }) => {
  const { notifications, _getNotification } = useContext(AppContext)
  const [state, setState] = useState({
    loading: false,
    readed: [],
    unreaded: []
  })
  const [refreshing, setRefreshing] = useState(false)

  const { loading, unreaded, readed } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useEffect(() => {
    const sub = navigation.addListener('focus', () => {
      handleRefresh()
    })
    return () => sub()
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      if (notifications?.length > 0) {
        const readed = notifications?.filter(e => e.is_read === true)
        const unreaded = notifications?.filter(e => e.is_read === false)
        handleChange('readed', readed)
        handleChange('unreaded', unreaded)
      } else {
        handleChange('readed', [])
        handleChange('unreaded', [])
      }
    }, [notifications])
  )

  const _readNotification = async id => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      await readNotification(id, token)
      handleChange('loading', false)
      _getNotification()
    } catch (error) {
      handleChange('loading', false)
      Toast.show(`Error: ${error.message}`)
    }
  }

  const handleNavigation = item => {
    if (item?.name?.toLowerCase().includes('leave')) {
      navigation.navigate('RequestLeaveScene')
    } else if (item?.name?.toLowerCase().includes('new employee')) {
      navigation.navigate('EmployeeListScene')
    }
  }

  const _renderItem = (item, index) => {
    return (
      <View key={index} style={styles.list}>
        <View style={styles.listView}>
          <FastImage
            source={
              item?.name?.toLowerCase()?.includes('clock')
                ? clock
                : item?.name?.toLowerCase()?.includes('leave')
                ? time
                : NotificationIcon
            }
            style={styles.itemImage}
            resizeMode="contain"
          />
          <View
            style={{
              width: '65%'
            }}
          >
            <Text
              style={{
                ...Fonts.poppinsRegular(14),
                color: Colors.BLACK
              }}
            >
              {item?.description}
            </Text>
          </View>
          <View style={styles.optionView}>
            <Text style={[styles.smallText]}>
              {moment.utc(item?.created_at).local().fromNow()}
            </Text>
            {!item?.is_read && (
              <View>
                <CheckBox
                  title={''}
                  checkedIcon={
                    <Icon
                      name={'checkbox-marked'}
                      type={'material-community'}
                      color={Colors.BACKGROUND_BG}
                    />
                  }
                  uncheckedIcon={
                    <Icon
                      name={'checkbox-blank-outline'}
                      type={'material-community'}
                      color={Colors.BLUR_TEXT}
                    />
                  }
                  textStyle={styles.forgotText}
                  containerStyle={[styles.checkedBox]}
                  onPress={() => {
                    handleNavigation(item)
                    _readNotification(item?.id)
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await _getNotification()
    setRefreshing(false)
  }

  return (
    <>
      <Header
        leftButton
        title={'Notifications'}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={styles.container}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={styles.listContainer}>
          <View style={styles.newContainer}>
            <View style={styles.newView}>
              <Text style={styles.listheading}>New</Text>
              <View
                style={{
                  marginLeft: 15,
                  marginTop: -5,
                  backgroundColor: Colors.RED_COLOR,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 5
                }}
              >
                <Text style={{ color: Colors.WHITE, marginTop: -1 }}>
                  {unreaded?.length}
                </Text>
              </View>
            </View>
            <Text style={styles.markasall}>Mark as read</Text>
          </View>
          {loading && <ActivityIndicator color={Colors.BACKGROUND_BG} />}
          <FlatList
            data={unreaded}
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => _renderItem(item, index)}
          />
          <View style={[{ alignItems: 'flex-start', width: '90%' }]}>
            <Text style={styles.listheading}>Reviewed</Text>
          </View>
          <FlatList
            data={readed}
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => _renderItem(item, index)}
          />
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
    // backgroundColor: colors.background
  },
  mainBody: {
    width: '90%',
    flex: 1,
    marginTop: 20,
    alignItems: 'center'
  },
  scroll: {
    flex: 1
    // backgroundColor: colors.background
  },
  center: {
    alignItems: 'center'
  },
  newContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20
  },
  newView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  dot: {
    width: 8,
    height: 8,
    // backgroundColor: colors.redAlert,
    borderRadius: 10,
    marginRight: 8
  },
  smallText: {
    ...Fonts.poppinsRegular(10),
    textAlign: 'right'
    // fontFamily: FONT1MEDIUM,
    // color: colors.white
  },
  markasall: {
    // fontFamily: FONT1REGULAR,
    ...Fonts.poppinsRegular(14),
    color: Colors.BLUR_TEXT,
    textTransform: 'uppercase'
  },
  checkedBox: {
    // backgroundColor: 'transparent'
    // marginRight: -15
  },
  countText: {
    ...Fonts.poppinsRegular(14),
    // fontFamily: FONT1REGULAR,
    // color: colors.white,
    fontSize: 13
  },
  count: {
    width: 25,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
    // backgroundColor: colors.secondary,
    borderRadius: 25
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkedBoxView: {
    // alignItems: 'flex-end'
    // width: '100%',
    // marginTop: 0
  },
  listheading: {
    ...Fonts.poppinsRegular(18)
    // color: colors.white,
    // fontFamily: FONT1BOLD
  },
  header: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row'
  },
  optionView: {
    alignItems: 'center',
    width: '20%'
  },
  titleStyle: {
    // color: colors.white,
    // fontFamily: FONT1BOLD
  },
  list: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10
  },
  listContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
    marginTop: -10,
    zIndex: -1
  },
  rowList: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  listContnet: {
    padding: 20
  },
  listView: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 10,
    paddingBottom: 10,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1
  },
  listImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8
  },
  socialBox: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 8,
    // backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    width: '15%',
    marginRight: 10
  }
})
export default Notifications
