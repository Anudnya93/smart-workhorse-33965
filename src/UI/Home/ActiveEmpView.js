import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity
} from 'react-native'
import { BaseScene, Button } from '../Common'
import { Fonts, Colors } from '../../res'
import AppContext from '../../Utils/Context'
import userProfile from '../../res/Images/common/sample.png'
import Icon from '../Common/Icon'

export default class ActiveEmpView extends BaseScene {
  static contextType = AppContext
  constructor(props) {
    super(props)
    this.state = {
      isActive: false
    }
  }

  handleChange = (key, value) => {
    this.setState(pre => ({ ...pre, [key]: value }))
  }

  renderEmployeeCell(item) {
    return (
      <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={
            item?.profile_image ? { uri: item?.profile_image } : userProfile
          }
          style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            marginRight: 10,
            resizeMode: 'cover'
          }}
        />
        <View>
          <Text style={styles.employeeName}>{item?.name}</Text>
          <Text style={styles.employeeWorksite}>{item?.worksite?.name}</Text>
        </View>
      </View>
    )
  }

  renderUpperView() {
    const { isActive } = this.state
    return (
      <TouchableOpacity
        onPress={() => this.handleChange('isActive', !isActive)}
        style={styles.upperView}
      >
        <Text style={styles.title}>{this.ls('activeEmployees')}</Text>
        <Icon
          name={isActive ? 'angle-up' : 'angle-down'}
          family="font-awesome"
          style={{
            position: 'absolute',
            right: 20
          }}
          size={30}
        />
      </TouchableOpacity>
    )
  }

  renderBottomView(upcomingShiftData) {
    return (
      <View style={styles.bottomView}>
        <Text style={styles.title}>
          {this.ls('payPeriod')} {upcomingShiftData?.total_hours || 0}h
        </Text>
      </View>
    )
  }

  render() {
    const { isActive } = this.state
    const { upcomingShiftData } = this.context
    return (
      <>
        <View style={styles.container}>
          {this.renderUpperView()}
          {isActive && (
            <FlatList
              scrollEnabled={false}
              data={upcomingShiftData?.active_employees}
              renderItem={({ item }) => this.renderEmployeeCell(item)}
            />
          )}
        </View>
        {this.renderBottomView(upcomingShiftData)}
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 20,
    borderWidth: 0.5,
    borderColor: '#bfefec'
  },
  upperView: {
    backgroundColor: '#dedede',
    borderRadius: 10,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20
  },
  bottomView: {
    backgroundColor: '#dedede',
    borderRadius: 10,
    marginBottom: 40,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20
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
    tintColor: Colors.BUTTON_BG,
    width: 30,
    height: 30
  },
  employeeName: {
    ...Fonts.poppinsRegular(14)
  },
  employeeWorksite: {
    ...Fonts.poppinsRegular(12),
    color: Colors.HOME_DES
  }
})
