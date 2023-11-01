import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import DatePicker from 'react-native-datepicker'
import { Colors, Fonts } from '../../res'
import BaseComponent from './BaseComponent'

class DateSelectionView extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      fromDate: null,
      toDate: null,
      isToDateValid: false,
      isFromDateValid: false
    }
  }

  renderIcon(type) {
    return (
      <TouchableOpacity
        style={[styles.rightInputView, { top: 15 }]}
        onPress={() =>
          type == 'From'
            ? this.fromDatePicker.onPressDate()
            : this.toDatePicker.onPressDate()
        }
      >
        <Image {...this.images('calendar')} />
      </TouchableOpacity>
    )
  }

  getProps() {
    return {
      format: 'MM/DD/YYYY',
      display: 'default',
      showIcon: false,
      confirmBtnText: 'Confirm',
      cancelBtnText: 'Cancel',
      date: this.state.fromDate,
      maxDate: new Date(),
      mode: 'date',
      androidMode: 'spinner',
      customStyles: {
        dateInput: styles.dateInputStyles,
        dateText: styles.dateInputText,
        datePicker: { justifyContent: 'center' },
        placeholderText: { ...styles.dateInputText, opacity: 0.3 }
      }
    }
  }

  renderFromDatePicker() {
    return (
      <View style={styles.textPickerContainer}>
        <DatePicker
          theme="light"
          ref={o => (this.fromDatePicker = o)}
          style={{ width: '95%' }}
          placeholder={'From'}
          androidMode={'spinner'}
          {...this.getProps()}
          date={this.state.fromDate}
          maxDate={this.state.fromDate ? this.state.fromDate : new Date()}
          onDateChange={text => {
            if (text && this.state.toDate) {
            }
            this.setState({ fromDate: text })
          }}
        />
        {this.renderIcon('From')}
      </View>
    )
  }

  renderToDatePicker() {
    return (
      <View style={[styles.textPickerContainer, {}]}>
        <DatePicker
          ref={o => (this.toDatePicker = o)}
          style={{ width: '95%', marginLeft: 8 }}
          placeholder={'To'}
          {...this.getProps()}
          date={this.state.toDate}
          minDate={this.state.fromDate}
          onDateChange={text => {
            if (text && this.state.fromDate) {
            }
            this.setState({ toDate: text })
          }}
        />
        <TouchableOpacity
          style={[styles.rightInputView, { top: 15, right: 10 }]}
          onPress={() => this.toDatePicker.onPressDate()}
        >
          <Image {...this.images('calendar')} />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {this.renderFromDatePicker()}
        {this.renderToDatePicker()}
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 15,

    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  textPickerContainer: {
    width: '45%'
  },
  dateText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_INPUT_LABEL
  },
  dateInputStyles: {
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER,
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    height: 50
  },
  dateInputText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_INPUT_COLOR
  },
  rightInputView: {
    position: 'absolute',
    right: 20
  }
})

export default DateSelectionView
