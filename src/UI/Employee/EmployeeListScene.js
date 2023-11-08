import React from 'react'
import { View, StyleSheet } from 'react-native'
import { BaseScene, Header, Fab } from '../Common'
import { Fonts, Colors } from '../../res'
import EmployeesList from './EmployeesList'

export default class EmployeeListScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      empty: true
    }
  }

  renderContent() {
    const { empty } = this.state
    console.log({ empty })
    return (
      <View style={styles.childContainer}>
        <EmployeesList
          navigation={this.props.navigation}
          callback={() => {
            this.setState(p => ({ ...p, empty: false }))
          }}
        />
      </View>
    )
  }

  render() {
    const { empty } = this.state
    return (
      <View style={styles.container}>
        <Header
          leftIcon={{ ...this.images('arrowLeft') }}
          leftButton
          title={'My Employees'}
          onLeftPress={() => this.props.navigation.goBack()}
        />
        {this.renderContent()}
        {!empty && (
          <Fab onPress={() => this.props.navigation.navigate('addEmployee')} />
        )}
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
