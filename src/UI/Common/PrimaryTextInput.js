import React, { Component } from 'react'
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform
} from 'react-native'
import { Fonts, Colors, Images } from '../../res'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu'
import DatePicker from 'react-native-datepicker'
import { Icon } from 'react-native-elements'
import { ScrollView } from 'react-native'
import Toast from 'react-native-simple-toast'
import { widthPercentageToDP } from 'react-native-responsive-screen'

class PrimaryTextInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: this.props.text || '',
      isFocused: false,
      isValid: false,
      isPwdVisible: false,
      showDatePicker: false
    }
    this.onFocus = this.onFocus.bind(this)
    this.onChangeText = this.onChangeText.bind(this)
    this.onBlur = this.onBlur.bind(this)
  }

  text() {
    return this.state.text ? this.state.text : ''
  }

  clear() {
    this.setState({ text: '' })
  }

  isValid(text, countryCodeInput) {
    if (!!text || !!this.state.text) {
      let inputText = text || this.state.text
      const regex = this.props.regex
      if (regex && regex instanceof RegExp && !countryCodeInput && inputText) {
        return regex.test(inputText)
      } else if (this.props.onValidationCheck) {
        return this.props.onValidationCheck(inputText.trim())
      } else {
        return true
      }
    }
    return false
  }

  onFocus() {
    if (this.props.handleFocus) {
      Keyboard.dismiss()
      // this.txtInput?.blur()
    } else if (this.props.dateType) {
      // this.txtInput.blur()
      Keyboard.dismiss()
      this.datePicker.onPressDate()
    } else if (this.props.dropdown) {
      // this.txtInput.blur()
      Keyboard.dismiss()
      this.inputRefs.togglePicker(true)
    } else {
      this.setState({ isFocused: true })
    }
  }

  onBlur = key => {
    console.log('this.props', this.props.placeholder)
    if (this.props.regex?.test(this.state?.text)) {
      this.setState({ isFocused: false })
    }
  }

  borderColor() {
    return this.state.isFocused
      ? this.state.text
        ? this.state.isValid && !this.props.isPassInValid
          ? Colors.VALID_TEXT_INPUT
          : Colors.INVALID_TEXT_INPUT
        : Colors.FOCUSSED_TEXT_INPUT
      : Colors.TEXT_INPUT_BORDER
  }

  onChangeText(text) {
    const isValid = this.isValid(text)
    this.props.onChangeText(text, isValid)
    this.setState({ text, isValid })
  }

  onChangeDropdownText(item) {
    const isValid = this.isValid(item?.value)
    this.props.onChangeText(item?.value, isValid)
    this.setState({ text: item?.label, isValid })
  }

  renderDatePicker() {
    if (this.props.dateType) {
      return (
        <DatePicker
          theme="light"
          style={{
            width: '87%',
            top: 5,
            position: 'absolute',
            justifyContent: 'flex-start'
          }}
          ref={o => (this.datePicker = o)}
          mode="date"
          androidMode={'spinner'}
          display="default"
          placeholder=" "
          showIcon={false}
          confirmBtnText={'Confirm'}
          cancelBtnText={'Cancel'}
          format="MM/DD/YYYY"
          date={new Date(this.props.text ? this.props.text : Date.now())}
          maxDate={this.props.maxDate || new Date()}
          minDate={this.props.minDate || new Date('1900/01/01')}
          customStyles={{
            dateInput: [
              styles.inputStyle,
              {
                backgroundColor: 'transparent',
                borderWidth: 0,
                height: 40,
                borderColor: this.state.isFocused
                  ? Colors.FOCUSSED_TEXT_INPUT
                  : Colors.TEXT_INPUT_BORDER_COLOR
              }
            ],
            dateText: styles.dateText,
            datePicker: { justifyContent: 'center' },
            disabled: {
              backgroundColor: 'transparent'
            }
          }}
          onDateChange={text => this.onChangeText(text)}
          disabled={this.props.disabled || false}
        />
      )
    }
  }

  renderDropDownPicker() {
    if (this.props.dropdown) {
      const list =
        this.props.streetCity || !!this.props.secondaryItems
          ? this.props.secondaryItems
            ? this.props.secondaryItems
            : [{ label: '', value: '' }]
          : this.props.items
      return (
        // <RNPickerSelect
        //   items={
        //     this.props.streetCity || !!this.props.secondaryItems
        //       ? this.props.secondaryItems
        //         ? this.props.secondaryItems
        //         : [{ label: "", value: "" }]
        //       : this.props.items
        //   }
        //   ref={el => {
        //     this.inputRefs = el
        //   }}
        //   placeholder={{
        //     label: this.state.text
        //       ? this.props.label
        //       : !this.props.text
        //       ? this.props.label
        //       : null,
        //     value: null
        //   }}
        //   fixAndroidTouchableBug
        //   Icon={() => {
        //     return <Image {...Images.downArrow} />
        //   }}
        //   doneText={this.props.text}
        //   // value={this.props.text}
        //   style={{
        //     inputIOS: styles.inputIOS,
        //     iconContainer: styles.iconContainer,
        //     inputAndroid: styles.inputAndroid,
        //     inputAndroidContainer: {}
        //   }}
        //   onValueChange={(itemValue, itemIndex) => {
        //     this.onChangeText(itemValue)
        //   }}
        // />
        <Menu
          // ref={el => {
          //   this.inputRefs = el
          // }}
          // rendererProps={{
          //   anchorStyle: {
          //     backgroundColor: 'transparent'
          //   }
          // }}
          style={[styles.inputStyle, { paddingTop: 0 }, this.props.inputStyle]}
        >
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity
            }}
            style={{ width: '100%' }}
          >
            <View
              style={[
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  height: '100%'
                }
              ]}
            >
              <Text
                style={{
                  color: !this.state.text
                    ? Platform.OS == 'ios'
                      ? '#bbb'
                      : '#666'
                    : Colors.BLACK,
                  ...Fonts.poppinsRegular(14),
                  textTransform: 'capitalize'
                }}
              >
                {this.state.text
                  ? this.state.text
                  : this.props.text
                  ? this.props.text
                  : this.props.label || this.state.text}
              </Text>
              <Icon
                name="down"
                size={12}
                color={Colors.BLACK}
                style={{ marginLeft: 10 }}
                type="antdesign"
              />
            </View>
          </MenuTrigger>
          <MenuOptions
            optionsContainerStyle={{
              width: '90%',
              marginLeft: -widthPercentageToDP(4),
              marginTop: 50,
              borderRadius: 8
            }}
          >
            <ScrollView style={{ maxHeight: 300 }}>
              {list?.map((item, index) => (
                <MenuOption
                  style={{
                    paddingLeft: 15,
                    paddingVertical: 5
                  }}
                  customStyles={{
                    OptionTouchableComponent: TouchableOpacity,
                    optionText: {
                      ...Fonts.poppinsRegular(14)
                    }
                  }}
                  key={index}
                  onSelect={() => this.onChangeDropdownText(item)}
                  text={item?.label}
                />
              ))}
            </ScrollView>
          </MenuOptions>
        </Menu>
      )
    }
  }

  renderRightInputView() {
    if (this.props.passwordPolicy) {
      return (
        <TouchableOpacity
          style={styles.rightInputView}
          hitSlop={{ right: 20, left: 20 }}
          onPress={() => {
            this.setState({ isPwdVisible: !this.state.isPwdVisible })
          }}
        >
          {this.state.isPwdVisible ? (
            <Icon name="eye" type="feather" color={'#818080'} size={20} />
          ) : (
            <Image
              {...Images.hide}
              style={{ resizeMode: 'contain', width: 20, height: 20 }}
            />
          )}
        </TouchableOpacity>
      )
    } else if (this.props.dateType) {
      return (
        <TouchableOpacity style={[styles.rightInputView, { top: 17 }]}>
          <Image {...Images.calendar} />
        </TouchableOpacity>
      )
    } else if (this.props.dropdown) {
      return (
        <TouchableOpacity style={[styles.rightInputView, { top: 18 }]}>
          <Image {...Images.arrowDown} />
        </TouchableOpacity>
      )
    } else if (this.props.rightIcon) {
      return (
        <TouchableOpacity
          style={[styles.rightInputView, { top: 15, right: 35 }]}
        >
          <Image
            {...this.props.rightIcon}
            style={{ resizeMode: 'contain', width: 20, height: 20 }}
          />
        </TouchableOpacity>
      )
    }
  }

  renderTextInput = () => {
    return (
      <TextInput
        style={[
          styles.inputStyle,
          { borderColor: this.borderColor() },
          this.props.inputStyle
        ]}
        ref={ref => {
          if (ref?.value) {
            return (
              ref &&
              ref.value &&
              ref.setNativeProps({
                style: { ...Fonts.poppinsRegular(14) }
              })
            )
          } else {
            return (
              ref &&
              ref.setNativeProps({
                style: { ...Fonts.poppinsRegular(14) }
              })
            )
          }
        }}
        placeholder={!this.props.dropdown ? this.props.label : ''}
        textAlignVertical="top"
        multiline={this.props.multiline}
        onFocus={() => this.onFocus()}
        // ref={o => (this.txtInput = o)}
        onBlur={() => this.onBlur(this.props.key)}
        maxLength={this.props.maxLength}
        onChangeText={text => this.onChangeText(text)}
        value={
          this.props.override
            ? this.props.text
            : this.state.text || this.props.text
        }
        secureTextEntry={
          (this.state.text !== '' || this.props.text !== '') &&
          !this.state.isPwdVisible &&
          !!this.props.onPasswordValidationCheck
        }
        {...this.props.textInputProps}
      />
    )
  }

  primaryTextInput(inputStyle) {
    if (this.props.dropdown) {
      return (
        <TouchableOpacity
          disabled={false}
          // onPress={() => this.inputRefs.togglePicker()}
        >
          <View>{this.renderTextInput(inputStyle)}</View>
        </TouchableOpacity>
      )
    }
    return this.renderTextInput(inputStyle)
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {!this.props.dropdown ? (
          <>
            {this.renderTextInput(styles)}
            {this.renderRightInputView(styles)}
            {this.renderDatePicker(styles)}
          </>
        ) : (
          this.renderDropDownPicker(styles)
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 7
  },
  inputStyle: {
    height: 50,
    width: '90%',
    paddingTop: Platform.OS === 'android' ? 15 : 0,
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    paddingHorizontal: 15,
    ...Fonts.poppinsRegular(14),
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER
  },
  rightInputView: {
    position: 'absolute',
    right: 30,
    top: 15
  },
  inputIOS: {
    height: 50,
    position: 'absolute',
    bottom: 0,
    width: '90%',
    paddingHorizontal: 30,
    color: 'transparent',
    ...Fonts.poppinsRegular(14)
  },
  inputAndroid: {
    // height: 44,
    position: 'absolute',
    bottom: 0,
    left: 25,
    width: '90%',
    paddingHorizontal: 20
  },
  dateText: { display: 'none' }
})

export default PrimaryTextInput
