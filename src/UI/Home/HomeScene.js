import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { BaseScene, Header } from '../Common'
import { Fonts, Colors } from '../../res'
import ShiftView from './ShiftView'
import ActiveEmpView from './ActiveEmpView'
import registerAppWithFCM from '../../Utils/registerDeviceforPush'
export default class HomeScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {}
  }

  renderContent() {
    return (
      <ScrollView nestedScrollEnabled={false} style={styles.childContainer}>
        <ShiftView />
        <ActiveEmpView />
      </ScrollView>
    )
  }

  componentDidMount() {
    registerAppWithFCM()
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftIcon={{ ...this.images('bar') }}
          leftButton
          onLeftPress={() =>
            this.props.navigation.toggleDrawer({
              side: 'left',
              animated: true
            })
          }
          rightIcon={{ ...this.images('bell') }}
          onRightPress={() => this.props.navigation.navigate('Notifications')}
        />
        {this.renderContent()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsRegular(22),
    color: Colors.TEXT_COLOR,
    marginTop: 20
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
