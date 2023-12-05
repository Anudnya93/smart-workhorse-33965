import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native'
import { BaseScene, Header } from '../Common'
import { Fonts, Colors } from '../../res'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppContext from '../../Utils/Context'
import LogoutModal from './LogoutModal'
import DeleteModal from './DeleteModal'
import { deleteAccount, deleteFCMToken } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import { Linking } from 'react-native'
import { Alert } from 'react-native'

export default class SettingScene extends BaseScene {
  static contextType = AppContext
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      visible1: false,
      loadingDelete: false,
      data: [
        {
          icon: 'lock',
          screen: 'changePassword',
          title: 'Change Password'
        },
        // {
        //   icon: 'lock',
        //   screen: 'paymentScene',
        //   title: 'Payments'
        // },
        {
          icon: 'terms',
          screen: 'termsPrivacy',
          link: 'https://cleanrnow.com/terms-and-conditions',
          title: 'Terms & Conditions'
        },
        {
          icon: 'privacy',
          link: 'https://cleanrnow.com/privacy-policy',
          screen: 'privacyPolicy',
          title: 'Privacy Policy'
        },
        {
          icon: 'chat',
          screen: 'feedbackScene',
          title: 'Support/Send Feedback'
        },
        {
          icon: 'logout',
          screen: 'SettingScene',
          title: 'Logout'
        },
        {
          icon: 'delete',
          screen: 'SettingScene',
          title: 'Delete account'
        }
      ]
    }
  }

  logout = async () => {
    const token = await AsyncStorage.getItem('token')
    const fcmtoken = await AsyncStorage.getItem('fcmtoken')
    deleteFCMToken(
      {
        'fcm-token': fcmtoken
      },
      token
    ).then(deleteres => {
      console.log({ deleteres })
    })
    const { setAdminProfile, setUser } = this.context
    const navigation = this.props.navigation
    setUser(null)
    setAdminProfile(null)
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    await AsyncStorage.removeItem('fcmtoken')
    navigation.navigate('AuthLoading')
  }

  _deleteAccount = async () => {
    try {
      this.setState({ loadingDelete: true })
      const token = await AsyncStorage.getItem('token')
      await deleteAccount(token)
      this.logout()
      this.setState({ loadingDelete: false })
      Toast.show('Account has been deleted')
    } catch (error) {
      this.setState({ loadingDelete: false })
      Toast.show(`Error: ${error.message}`)
    }
  }

  openLink = async link => {
    await Linking.openURL(link)

    // const supported = await Linking.canOpenURL(link)
    // console.log({ link })
    // if (supported) {
    //   await Linking.openURL(link)
    // } else {
    //   Alert.alert(`Don't know how to open this URL: ${link}`)
    // }
  }

  renderContent() {
    return (
      <FlatList
        data={this.state.data}
        style={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              marginVertical: 5
            }}
            onPress={() =>
              item.link
                ? this.openLink(item?.link)
                : item.title === 'Logout'
                ? this.setState({ visible: true })
                : item.title === 'Delete account'
                ? this.setState({ visible1: true })
                : this.props.navigation.navigate(item.screen)
            }
          >
            <Image
              {...this.images(item.icon)}
              style={{ height: 20, width: 20, resizeMode: 'contain' }}
            />
            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          title={this.ls('settings')}
          leftButton
          onLeftPress={() => this.props.navigation.goBack()}
        />
        {this.renderContent()}
        <LogoutModal
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          logout={this.logout}
        />
        <DeleteModal
          visible={this.state.visible1}
          loading={this.state.loadingDelete}
          onCancel={() => this.setState({ visible1: false })}
          logout={this._deleteAccount}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  text: {
    ...Fonts.poppinsRegular(18),
    color: Colors.TEXT_COLOR,
    marginHorizontal: 20
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
  }
})
