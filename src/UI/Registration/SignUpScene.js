import React from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { BaseScene, Button, Forms, PrimaryTextInput } from '../Common'
import { Fonts, Colors } from '../../res'
import { AsyncHelper } from '../../Utils'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { checkEmailAvailability, signupUser } from '../../api/auth'
import Toast from 'react-native-simple-toast'
import PhoneInput from 'react-native-phone-input'
import { Platform } from 'react-native'
import countryList from '../../constants/countries'
import CustomPhoneInput from '../Common/CustomPhoneInput'

const MandatoryFields = [
  'first_name',
  'last_name',
  'phone',
  'email',
  'password',
  'business_code'
]

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default class LoginScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      isFormValid: false,
      termsConditions: true,
      env: '',
      isPassInValid: false,
      validNumber: false,
      forms: Forms.fields('signUp'),
      errors: {},
      checking: false
    }
    this.isFormValid = this.isFormValid.bind(this)
    this.phoneRef = React.createRef()
  }

  async componentDidMount() {
    const env = await AsyncHelper.getEnv()
    this.setState({
      env,
      forms:
        env == 'employee' ? Forms.fields('signUpEmp') : Forms.fields('signUp')
    })
  }

  isFormValid() {
    let error = null
    this.state.forms.map(i => {
      if (!this[i.key].isValid()) {
        error = i.key
        return true
      }
      return false
    })
    if (error) {
      this.setState({ isFormValid: false })
      return false
    }
    this.setState({ isFormValid: true })
    return true
  }

  checkPass = value => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (regex.test(value)) {
      this.handleChange('isPassInValid', false)
    } else {
      this.handleChange('isPassInValid', true)
    }
  }

  onSubmit = () => {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      isPassInValid,
      isFormValid
    } = this.state

    const disabled =
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !phone ||
      isPassInValid ||
      !isFormValid

    const emailCheck = email && emailRegex.test(email)

    const phoneCheck = phone?.startsWith('+91')
      ? phone?.length == 16
      : phone?.length == 15

    if (disabled || !emailCheck || !phoneCheck) {
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

    const payload = {
      name: first_name + ' ' + last_name,
      email,
      password,
      phone
    }
    console.log(payload)
    this.props.navigation.navigate('signupComplete', { values: payload })
  }

  onNext = () => {
    this.setState(p => ({
      ...p,
      checking: true
    }))
    checkEmailAvailability({
      email: this.state.email
    })
      .then(res => {
        this.onSubmit()
      })
      .catch(e => {
        console.log({ err: e.response })
        Toast.show(
          'Email Already Exists. Please try with different Email Address !'
        )
      })
      .finally(() => {
        this.setState(p => ({
          ...p,
          checking: false
        }))
      })
  }

  handleSignup = async () => {
    const disabled =
      !this.state.first_name ||
      !this.state.last_name ||
      !this.state.email ||
      !this.state.password ||
      !this.state.phone ||
      this.state.isPassInValid ||
      !this.state.business_code
    const emailCheck = this.state.email && emailRegex.test(this.state.email)

    const phoneCheck = this.state.phone?.startsWith('+91')
      ? this.state.phone?.length == 16
      : this.state.phone?.length == 15
    try {
      if (disabled || !emailCheck || !phoneCheck) {
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
      } else if (!this.state.termsConditions) {
        Toast.show('Accept Terms & Conditions and Privacy Policy to continue')
        return
      }
      this.handleChange('loading', true, true)
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        business_code,
        termsConditions
      } = this.state
      const payload = {
        first_name,
        last_name,
        email,
        password,
        phone,
        business_code,
        is_read_terms: termsConditions
      }
      const res = await signupUser(payload)
      this.handleChange('loading', false, true)
      this.props.navigation.navigate('VerifyAccount', {
        email: payload?.email,
        userData: payload
      })
      Toast.show('Signed up Successfully, Please verify your account!')
    } catch (error) {
      // console.warn("error", error)
      this.handleChange('loading', false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  handleChange = (key, value, isValid) => {
    if (key === 'phone') {
      this.setState(pre => ({
        ...pre,
        validNumber: this.phoneRef?.current?.isValidNumber()
      }))
    }
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

  renderTextInput() {
    return this.state.forms.map(fields => {
      if (fields?.key === 'phone') {
        return (
          <CustomPhoneInput
            viewStyle={[
              {
                marginVertical: 8
              },
              this.state.errors[fields.key] && styles.errorBorder
            ]}
            setter={val => {
              this.setState(pre => ({
                ...pre,
                [fields.key]: val,
                errors: { ...this.state.errors, [fields.key]: false }
              }))
            }}
            placeholder={
              MandatoryFields.includes(fields.key)
                ? fields.label + '*'
                : fields.label
            }
            val={this.state[fields.key]}
            handleInvalid={() => {
              this.setState(pre => ({
                ...pre,
                validNumber: false
              }))
            }}
            handleValid={() => {
              this.setState(pre => ({
                ...pre,
                validNumber: true
              }))
            }}
          />
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            isPassInValid={
              fields.key == 'password' ? this.state.isPassInValid : false
            }
            ref={o => (this[fields.key] = o)}
            key={fields.key}
            onChangeText={(text, isValid) =>
              this.handleChange(fields.key, text, isValid)
            }
            inputStyle={[this.state.errors[fields.key] && styles.errorBorder]}
            label={
              MandatoryFields.includes(fields.key)
                ? fields.label + '*'
                : fields.label
            }
          />
        )
      }
    })
  }

  renderFooterButton() {
    const { env } = this.state
    return (
      <Button
        onPress={env === 'employee' ? this.handleSignup : this.onNext}
        title={env == 'employee' ? this.ls('signUp') : this.ls('next')}
        loading={env == 'employee' ? this.state.loading : this.state.checking}
        style={styles.footerButton}
      />
    )
  }

  renderTermsView() {
    return (
      <View style={styles.termsContainer}>
        <BouncyCheckbox
          size={20}
          fillColor={Colors.BACKGROUND_BG}
          unfillColor={Colors.WHITE}
          disableBuiltInState
          iconStyle={{
            borderRadius: 100
          }}
          style={{ marginRight: -20, marginTop: -3 }}
          onPress={() =>
            this.handleChange('termsConditions', !this.state.termsConditions)
          }
          isChecked={this.state.termsConditions}
        />
        <Text style={styles.textStyle}>
          {'I have read '}
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.onTermsPress()}
          >
            {'Terms & Conditions'}
          </Text>
          <Text style={styles.textStyle}>{' and '}</Text>
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.onPrivacyPress()}
          >
            {'Privacy Policy'}
          </Text>
        </Text>
      </View>
    )
  }

  render() {
    const { env } = this.state
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          // contentContainerStyle={{
          //   height: Dimensions.get("window").height
          // }}
        >
          <Text style={styles.title}>{this.ls('signUp')}</Text>
          {/* <View style={{ height: "5%" }} /> */}
          {this.renderTextInput()}
          {this.state.isPassInValid && (
            <Text
              style={{
                color: Colors.INVALID_TEXT_INPUT,
                ...Fonts.poppinsRegular(12),
                width: '90%',
                marginLeft: '5%'
              }}
            >
              Password must be atleast 8 characters which contain at least one
              lowercase letter, one uppercase letter,at least one alphanumeric
              letter and one numeric digit
            </Text>
          )}
          {env == 'employee' && this.renderTermsView()}
          {this.renderFooterButton()}
        </KeyboardAwareScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20
  },
  title: {
    ...Fonts.poppinsRegular(28),
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: '20%'
  },
  footerButton: {
    marginBottom: 20
  },
  forgotPwdText: {
    ...Fonts.poppinsRegular(14),
    color: Colors.BUTTON_BG,
    marginRight: 20
  },
  termsContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 20
  },
  textStyle: {
    ...Fonts.poppinsRegular(12),
    marginLeft: 8,
    color: Colors.BLACK
  },
  linkStyle: {
    ...Fonts.poppinsRegular(12),
    color: Colors.BUTTON_BG
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
  }
})
