import React, { useEffect, useRef, useState } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Image
} from 'react-native'
import { Fonts, Colors, Images } from '../../res'
import Icon from '../../UI/Common/Icon'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import FastImage from 'react-native-fast-image'

const Countries = [
  {
    name: 'Canada',
    img: require('../../res/Images/countries/canada.png'),
    code: '+1'
  },
  {
    name: 'India',
    img: require('../../res/Images/countries/india.png'),
    code: '+91'
  },
  {
    name: 'USA',
    img: require('../../res/Images/countries/usa.png'),
    code: '+1'
  }
]

const CustomPhoneInput = ({
  val,
  viewStyle,
  style,
  setter,
  handleValid,
  handleInvalid,
  ...rest
}) => {
  const [max, setMax] = useState(16)
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState(val || '')
  const [focused, setFocused] = useState(false)
  const [code, setCode] = useState('')
  const textinputRef = useRef()
  const first = useRef(false)
  const borderColor = () => {
    return !focused
      ? Colors.TEXT_INPUT_BORDER
      : value?.length == max
      ? Colors.VALID_TEXT_INPUT
      : Colors.INVALID_TEXT_INPUT
  }

  const handleSelection = val => {
    setCode(val)
    setValue(val + '-')
    setter(val + '-')
    setVisible(false)
    if (val.includes('9')) {
      setMax(16)
    } else {
      setMax(15)
    }
    textinputRef.current.focus()
  }
  const formatPhoneNumber = value => {
    if (!value) {
      return value
    }
    const phoneNumber = value.replace(/[^\d]/g, '')
    const phoneNumberLength = phoneNumber?.length

    if (phoneNumberLength < code.length) {
      return `+${phoneNumber.slice(0, code.length - 1)}-`
    } else if (phoneNumberLength < code.length + 3) {
      return `+${phoneNumber.slice(0, code.length - 1)}-${phoneNumber.slice(
        code.length - 1
      )}`
    } else if (phoneNumberLength < code.length + 6) {
      return `+${phoneNumber.slice(0, code.length - 1)}-${phoneNumber.slice(
        code.length - 1,
        code.length + 2
      )}-${phoneNumber.slice(code.length + 2)}`
    } else {
      return `+${phoneNumber.slice(0, code.length - 1)}-${phoneNumber.slice(
        code.length - 1,
        code.length + 2
      )}-${phoneNumber.slice(
        code.length + 2,
        code.length + 5
      )}-${phoneNumber.slice(code.length + 5)}`
    }
  }
  const handleTextChange = val => {
    const formatted = formatPhoneNumber(val)
    setValue(formatted)
    setter(formatted)
  }
  useEffect(() => {
    if (val) {
      if (val.startsWith('+9')) {
        setCode('+91')
        setMax(16)
      } else {
        setCode('+1')
        setMax(15)
      }
    }
  }, [])
  useEffect(() => {
    if (value && !first.current && code) {
      first.current = true
      const formatted = formatPhoneNumber(value)
      setValue(formatted)
      setter(formatted)
      handleInvalid && handleValid()
    }
  }, [code])
  useEffect(() => {
    if (value.length == max) {
      handleValid && handleValid()
    } else {
      handleInvalid && handleInvalid()
    }
  }, [value])
  return (
    <>
      <View style={[styles.view, { borderColor: borderColor() }, viewStyle]}>
        <TextInput
          ref={textinputRef}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (value?.length == 0) {
              setVisible(true)
            }
            setFocused(true)
          }}
          onBlur={() => {
            if (max == value.length) {
              setFocused(false)
            }
          }}
          maxLength={max}
          keyboardType="phone-pad"
          style={[styles.inputStyle, style]}
          {...rest}
        />
        <TouchableOpacity
          style={styles.flagIcon}
          onPress={() => {
            setVisible(true)
          }}
        >
          <Icon name="flag" family="feather" color={'grey'} />
        </TouchableOpacity>
      </View>
      <Modal animationType="none" visible={visible} transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {Countries.map(item => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    handleSelection(item.code)
                  }}
                  style={styles.countryItem}
                >
                  <FastImage
                    source={item.img}
                    style={{ width: 50, height: 30 }}
                    resizeMode="cover"
                  />
                  <View style={styles.countryName}>
                    <Text
                      style={{
                        ...Fonts.poppinsRegular(14),
                        textAlign: 'center'
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={{ ...Fonts.poppinsRegular(14) }}>
                    {item.code}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </Modal>
    </>
  )
}

export default CustomPhoneInput

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%'
  },
  view: {
    width: '90%',
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Platform.OS == 'android' ? 10 : 15,
    marginHorizontal: widthPercentageToDP(5)
  },
  inputStyle: {
    ...Fonts.poppinsRegular(14),
    height: 50,
    marginLeft: 25
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  countryName: {
    position: 'absolute',
    left: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%'
  },
  flagIcon: { position: 'absolute', left: 10, zIndex: 1, top: 13 }
})
