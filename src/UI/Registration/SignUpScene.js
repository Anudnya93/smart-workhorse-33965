import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { BaseScene, Button, Forms, PrimaryTextInput } from "../Common"
import { Fonts, Colors } from "../../res"
import { AsyncHelper } from "../../Utils"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { signupUser } from "../../api/auth"
import Toast from "react-native-simple-toast"
import PhoneInput from "react-native-phone-input"
import { Platform } from "react-native"

export default class LoginScene extends BaseScene {
  constructor(props) {
    super(props)
    this.state = {
      isFormValid: false,
      termsConditions: false,
      env: "",
      isPassInValid: false,
      validNumber: false,
      forms: Forms.fields("signUp")
    }
    this.isFormValid = this.isFormValid.bind(this)
    this.phoneRef = React.createRef()
  }

  async componentDidMount() {
    const env = await AsyncHelper.getEnv()
    this.setState({
      env,
      forms:
        env == "employee" ? Forms.fields("signUpEmp") : Forms.fields("signUp")
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
      this.handleChange("isPassInValid", false)
    } else {
      this.handleChange("isPassInValid", true)
    }
  }

  onSubmit = () => {
    const { first_name, last_name, email, password, phone } = this.state
    const payload = {
      name: first_name + " " + last_name,
      email,
      password,
      phone
    }
    console.log(payload)
    this.props.navigation.navigate("signupComplete", { values: payload })
  }

  handleSignup = async () => {
    try {
      this.handleChange("loading", true, true)
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
      this.handleChange("loading", false, true)
      this.props.navigation.navigate("VerifyAccount", {
        email: payload?.email,
        userData: payload
      })
      Toast.show("Signed up Successfully, Please verify your account!")
    } catch (error) {
      console.warn("error", error)
      this.handleChange("loading", false, true)
      const errorText = Object.values(error?.response?.data)
      Toast.show(`Error: ${errorText[0]}`)
    }
  }

  handleChange = (key, value, isValid) => {
    if (key === "phone") {
      this.setState(pre => ({
        ...pre,
        validNumber: this.phoneRef?.current?.isValidNumber()
      }))
    }
    if (key === "password") {
      this.checkPass(value)
    }
    this.setState(pre => ({ ...pre, [key]: value, isFormValid: isValid }))
  }

  renderTextInput() {
    return this.state.forms.map(fields => {
      if (fields?.key === "phone") {
        return (
          <View
            style={{
              height: 50,
              width: "90%",
              paddingTop: Platform.OS === "android" ? 15 : 0,
              borderRadius: 10,
              color: Colors.TEXT_INPUT_COLOR,
              paddingHorizontal: 15,
              ...Fonts.poppinsRegular(14),
              borderWidth: 1,
              backgroundColor: Colors.TEXT_INPUT_BG,
              width: "90%",
              marginLeft: "5%",
              marginVertical: 5,
              borderWidth: 1,
              borderColor:
                (fields.key === "phone" && !this.state.phone) ||
                (fields.key === "phone" &&
                  this.state.phone &&
                  this.state.validNumber)
                  ? Colors.TEXT_INPUT_BORDER
                  : Colors.INVALID_TEXT_INPUT
            }}
          >
            <PhoneInput
              initialValue={this.state[fields.key]}
              textProps={{ placeholder: fields.label }}
              textStyle={{ ...Fonts.poppinsRegular(14), marginTop: 2 }}
              ref={this.phoneRef}
              onChangePhoneNumber={props =>
                this.handleChange(fields.key, props)
              }
            />
          </View>
        )
      } else {
        return (
          <PrimaryTextInput
            {...fields}
            isPassInValid={this.state.isPassInValid}
            ref={o => (this[fields.key] = o)}
            key={fields.key}
            onChangeText={(text, isValid) =>
              this.handleChange(fields.key, text, isValid)
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
        onPress={env === "employee" ? this.handleSignup : this.onSubmit}
        title={env == "employee" ? this.ls("signUp") : this.ls("next")}
        loading={env == "employee" && this.state.loading}
        disabled={
          // !this.state.isFormValid ||
          !this.state.first_name ||
          !this.state.last_name ||
          !this.state.email ||
          !this.state.password ||
          !this.state.phone ||
          this.state.isPassInValid ||
          (env === "employee" &&
            (!this.state.business_code || !this.state.termsConditions))
        }
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
            borderColor: Colors.BLACK,
            borderRadius: 1
          }}
          style={{ marginRight: -20, marginTop: -3 }}
          onPress={() =>
            this.handleChange("termsConditions", !this.state.termsConditions)
          }
          isChecked={this.state.termsConditions}
        />
        <Text style={styles.textStyle}>
          {"I have read "}
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.navigation.navigate("termsPrivacy")}
          >
            {"Terms & Conditions"}
          </Text>
          <Text style={styles.textStyle}>{" and "}</Text>
          <Text
            style={styles.linkStyle}
            onPress={() => this.props.navigation.navigate("privacyPolicy")}
          >
            {"Privacy Policy"}
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
          <Text style={styles.title}>{this.ls("signUp")}</Text>
          {/* <View style={{ height: "5%" }} /> */}
          {this.renderTextInput()}
          {this.state.isPassInValid && (
            <Text
              style={{
                color: Colors.INVALID_TEXT_INPUT,
                ...Fonts.poppinsRegular(12),
                width: "90%",
                marginLeft: "5%"
              }}
            >
              Password must be atleast 8 characters which contain at least one
              lowercase letter, one uppercase letter,at least one alphanumeric
              letter and one numeric digit
            </Text>
          )}
          {env == "employee" && this.renderTermsView()}
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
    textAlign: "center",
    marginTop: "20%"
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
    justifyContent: "flex-start",
    flexDirection: "row",
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
  }
})
