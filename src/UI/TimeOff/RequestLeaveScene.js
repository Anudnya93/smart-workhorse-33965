import React from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import {
  BaseScene,
  Header,
  PrimaryTextInput,
  Button,
  DateSelectionView
} from '../Common'
import { Fonts, Colors } from '../../res'
import EmpRequestLeave from './EmpRequestLeave'
import DenyModal from './DenyModal'
import AppContext from '../../Utils/Context'
import Toast from 'react-native-simple-toast'
import { leaveRequest } from '../../api/employee'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment-timezone'
import { updateLeaveRequest } from '../../api/business'

const MandatoryFields = [
  'title',
  'request_type',
  'from_date',
  'to_date',
  'description'
]
export default class RequestLeaveScene extends BaseScene {
  static contextType = AppContext
  constructor(props) {
    super(props)
    this.state = {
      env: '',
      admin_note: '',
      denyModalVisible: false,
      leaveItem: null,
      errors: {}
    }
  }

  handleChange = (key, value, isValid) => {
    if (key === 'password') {
      this.checkPass(value)
    }
    this.setState(pre => ({
      ...pre,
      [key]: value,
      isFormValid: isValid,
      errors: { ...this.state.errors, [key]: false }
    }))
  }

  handleRequest = async () => {
    const { title, request_type, from_date, to_date, description } = this.state
    const disabled =
      !title || !description || !request_type || !from_date || !to_date

    try {
      if (disabled) {
        const newErrors = {}
        MandatoryFields.forEach(field => {
          if (!this.state[field]) {
            newErrors[field] = true
          }
        })
        console.log({ newErrors })
        // Highlight mandatory fields with red border if not filled
        this.setState(pre => ({ ...pre, errors: newErrors }))
        Toast.show('Please fill mandatory fields properly to continue')
        return
      }
      const { title, request_type, from_date, to_date, description } =
        this.state
      this.handleChange('loading', true, true)
      const payload = {
        title,
        request_type,
        from_date: moment(from_date).format('YYYY-MM-DD'),
        to_date: moment(to_date).format('YYYY-MM-DD'),
        description
      }
      const token = await AsyncStorage.getItem('token')
      await leaveRequest(payload, token)
      this.handleChange('loading', false, true)
      this.props.navigation.goBack()
      Toast.show('Leave Request Successfully Sent!')
    } catch (error) {
      // console.warn('error', error)
      this.handleChange('loading', false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  UpdateRequest = async (id, status) => {
    const { _getleaveRequest } = this.context
    try {
      const { admin_note } = this.state
      this.handleChange('loadingApprove', true, true)
      const payload = {
        status,
        admin_note
      }
      const token = await AsyncStorage.getItem('token')
      await updateLeaveRequest(id, payload, token)
      _getleaveRequest()
      this.handleChange('loadingApprove', false, true)
      this.handleChange('admin_note', '', true)
      this.handleChange('leaveItem', null, true)
      this.handleChange('denyModalVisible', false, true)
      // this.props.navigation.goBack()
      Toast.show(
        status === 'APPROVED'
          ? 'Request has been approved'
          : 'Request has been denied'
      )
    } catch (error) {
      // console.warn('error', error)
      this.handleChange('loadingApprove', false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  renderTitleInput() {
    return (
      <PrimaryTextInput
        ref={o => (this.title = o)}
        label={this.ls('title') + '*'}
        onChangeText={(text, isValid) =>
          this.handleChange('title', text, isValid)
        }
        inputStyle={[this.state.errors.title && styles.errorBorder]}
      />
    )
  }

  renderDescription() {
    return (
      <PrimaryTextInput
        ref={o => (this.description = o)}
        label={this.ls('description') + '*'}
        onChangeText={(text, isValid) =>
          this.handleChange('description', text, isValid)
        }
        inputStyle={[
          { height: 80 },
          this.state.errors.description && styles.errorBorder
        ]}
        multiline
      />
    )
  }

  renderDatesInput() {
    const { from_date, to_date } = this.state
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '95%',
          marginLeft: '2.5%',
          justifyContent: 'space-between'
        }}
      >
        <View style={{ width: '50%' }}>
          <PrimaryTextInput
            dateType={true}
            text={from_date}
            maxDate={new Date('2050/01/01')}
            label="From*"
            key="from_date"
            placeholder="from_date"
            onChangeText={(text, isValid) =>
              this.handleChange('from_date', text)
            }
            inputStyle={[this.state.errors.from_date && styles.errorBorder]}
          />
        </View>
        <View style={{ width: '50%' }}>
          <PrimaryTextInput
            dateType={true}
            maxDate={new Date('2050/01/01')}
            text={to_date}
            label="To*"
            key="to_date"
            placeholder="to_date"
            onChangeText={(text, isValid) => this.handleChange('to_date', text)}
            inputStyle={[this.state.errors.to_date && styles.errorBorder]}
          />
        </View>
      </View>
    )
  }

  renderTypeInput() {
    return (
      <PrimaryTextInput
        ref={o => (this.leaveType = o)}
        label={this.ls('leaveType') + '*'}
        onChangeText={(text, isValid) =>
          this.handleChange('request_type', text, isValid)
        }
        dropdown
        items={[
          { label: 'Paid', value: 'PAID' },
          { label: 'Unpaid', value: 'UNPAID' },
          { label: 'Sick', value: 'SICK' }
        ]}
        inputStyle={[this.state.errors.request_type && styles.errorBorder]}
      />
    )
  }

  renderButton() {
    const { loading } = this.state
    return (
      <Button
        title={this.ls('sendReq')}
        loading={loading}
        onPress={this.handleRequest}
        style={styles.footerButton}
      />
    )
  }

  renderContent() {
    const { user, leaveRequest } = this.context
    const { loadingApprove, admin_note, denyModalVisible, leaveItem } =
      this.state
    if (user?.role !== 'Organization Admin') {
      return (
        <KeyboardAwareScrollView style={styles.childContainer}>
          {this.renderTitleInput()}
          {this.renderTypeInput()}
          {this.renderDatesInput()}
          {this.renderDescription()}
          {this.renderButton()}
        </KeyboardAwareScrollView>
      )
    } else {
      return (
        <EmpRequestLeave
          leaveRequest={leaveRequest}
          loadingApprove={loadingApprove}
          denyModalVisible={denyModalVisible}
          leaveItem={leaveItem}
          handleChange={this.handleChange}
          UpdateRequest={this.UpdateRequest}
          admin_note={admin_note}
          onDenyPress={() => {
            console.log('hello')
            this.setState({ denyModalVisible: true })
          }}
        />
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftIcon={{ ...this.images('bar') }}
          leftButton
          title={this.ls('timeOffReq')}
          onLeftPress={() =>
            this.props?.navigation?.toggleDrawer({
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
    paddingVertical: 15
  },
  footerButton: {
    width: '90%',
    marginTop: '15%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 20,
    lineHeight: 24
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
  }
})
