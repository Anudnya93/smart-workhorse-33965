// @ts-nocheck
/* eslint-disable no-empty-pattern */
import React, { useEffect, useState } from "react"
import { AppButton, AppInput, AuthLeft } from "../../components"
import { Grid, Checkbox } from "@mui/material"
import eyeIcon from "../../assets/svg/eye.svg"
import { useNavigate } from "react-router-dom"
import {
  getProfile,
  getProfileForBusiness,
  loginUser,
  signupUser
} from "../../api/auth"
import AppContext from "../../Context"
import { useContext } from "react"
import { COLORS } from "../../constants"
import { useSnackbar } from "notistack"
import eyeCLose from "../../assets/images/closeEYE.jpg"
import { getleaveRequest } from "../../api/business"

export default function Login({}) {
  const navigate = useNavigate()

  const { enqueueSnackbar } = useSnackbar()
  const UserType = localStorage.getItem("UserType")
  const token = localStorage.getItem("token")
  const { user, setUser, _getProfile } = useContext(AppContext)
  const path = window.location.pathname
  const [state, setState] = useState({
    activeTab: 0,
    email: "",
    password: "",
    emailSignup: "",
    passwordSignup: "",
    loading: false,
    loadingSignup: false,
    checked: false,
    employee_types: "",
    first_name: "",
    last_name: "",
    business_code: "",
    phone: "",
    isShow: false
  })

  useEffect(() => {
    if (token) {
      navigate("/dashboard")
    }
  }, [token])

  const {
    email,
    password,
    loading,
    employee_types,
    activeTab,
    first_name,
    last_name,
    phone,
    is_read_terms,
    isShow,
    business_code
  } = state

  const handleChange = (key, value) => {
    setState(pre => ({
      ...pre,
      [key]: value
    }))
  }

  const onSubmit = () => {
    const payload = {
      name: first_name + " " + last_name,
      email,
      password,
      phone
    }
    if (UserType === "admin") {
      handleChange("activeTab", 2)
    } else {
      handleSignup(true)
    }
    // navigate("signupComplete", { values: payload })
  }

  const handleSignup = async isBusiness => {
    try {
      handleChange("loading", true)
      let payload
      if (UserType === "admin") {
        payload = {
          name: first_name + " " + last_name,
          email,
          password,
          phone,
          employee_types: employee_types || "Cleaner",
          is_read_terms
        }
      } else {
        payload = {
          first_name,
          last_name,
          email,
          password,
          phone,
          business_code,
          is_read_terms
        }
      }
      const res = await signupUser(payload)
      handleChange("loading", false)
      navigate("/verify/email")
      localStorage.setItem("email", payload?.email)
      enqueueSnackbar(`"Signed up Successfully, Please verify your account!"`, {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    } catch (error) {
      // console.warn("error", error)
      handleChange("loading", false)
      const errorText = Object.values(error?.response?.data)
      enqueueSnackbar(`Error: ${errorText[0]}`, {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    }
  }

  const handleLogin = async () => {
    try {
      handleChange("loading", true)
      const payload = {
        email,
        password
      }
      const res = await loginUser(payload)
      localStorage.setItem("token", res?.data?.key)
      localStorage.setItem("user", JSON.stringify(res?.data?.user))
      const res1 = await getleaveRequest(res?.data?.key)
      handleChange("loading", false)
      if (
        UserType === "admin" &&
        res?.data?.user?.role !== "Organization Admin"
      ) {
        alert("Please use business user")
        return
      }
      if (
        UserType === "employee" &&
        res?.data?.user?.role === "Organization Admin"
      ) {
        alert("Please use employee user")
        return
      }

      setUser(res?.data?.user)
      enqueueSnackbar(`Login Successful`, {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
      navigate("/dashboard")
    } catch (error) {
      handleChange("loading", false)
      const errorText = Object.values(error?.response?.data)
      if (errorText.length > 0) {
        if (errorText[0] === "Business Subscription currently is not active.") {
          navigate("/subscription")
        } else {
          alert(`Error: ${errorText[0]}`)
        }
      } else {
        alert(`Error: ${error}`)
      }
    }
  }

  return (
    <Grid container className="authSection">
      <AuthLeft />
      <Grid
        item
        xs={12}
        md={4}
        style={{
          justifyContent: activeTab === 1 ? "flex-start" : "center",
          paddingTop: activeTab === 1 ? 50 : 0,
          paddingBottom: activeTab === 1 ? 50 : 0
        }}
        className="divCenter loginRight"
      >
        <div className=" text-center font-30 font-bold">
          {activeTab === 2
            ? "How do you refer to your employees?"
            : activeTab === 1
            ? "Sign up"
            : "Welcome back"}
        </div>
        <div className="text_grey letter-spacing text_transform_none font-14">
          {activeTab === 2
            ? "Employees will see this term"
            : activeTab === 1
            ? "Create your account"
            : "Login to your account"}
        </div>
        {activeTab !== 2 && (
          <div className="tabs">
            <div
              onClick={() => handleChange("activeTab", 0)}
              className={activeTab === 0 ? "activeTab" : "inactiveTab"}
            >
              Sign in
            </div>
            <div
              onClick={() => handleChange("activeTab", 1)}
              className={activeTab === 1 ? "activeTab" : "inactiveTab"}
            >
              Sign up
            </div>
          </div>
        )}
        <div className="width80">
          {activeTab === 2 && (
            <>
              <AppInput
                value={employee_types}
                name={"employee_types"}
                onChange={handleChange}
                className="mb-3 mt-3"
                placeholder={"e.g. Cleaners, Janitors, Crew, Gang, Team..."}
              />
            </>
          )}
          {activeTab === 1 && (
            <>
              <AppInput
                value={first_name}
                name={"first_name"}
                onChange={handleChange}
                className="mb-3 mt-3"
                placeholder={"First Name"}
              />
              <AppInput
                value={last_name}
                name={"last_name"}
                onChange={handleChange}
                className="mb-3 mt-3"
                placeholder={"Last Name"}
              />
              <AppInput
                value={phone}
                name={"phone"}
                onChange={handleChange}
                className="mb-3 mt-3"
                placeholder={"Phone Number"}
              />
            </>
          )}
          {activeTab !== 2 && (
            <>
              <AppInput
                value={email}
                name={"email"}
                onChange={handleChange}
                className="mb-3 mt-3"
                placeholder={"Email Address"}
              />
              <AppInput
                className="mb-4 mt-3"
                value={password}
                type={isShow ? "text" : "password"}
                name={"password"}
                onChange={handleChange}
                postfix={
                  <img
                    src={isShow ? eyeIcon : eyeCLose}
                    style={{ objectFit: "contain" }}
                    onClick={() => handleChange("isShow", !isShow)}
                    width={20}
                    className={"c-pointer"}
                  />
                }
                placeholder={"********"}
              />
            </>
          )}
          {activeTab === 1 && UserType === "employee" && (
            <AppInput
              value={business_code}
              name={"business_code"}
              onChange={handleChange}
              className="mb-3 mt-3"
              placeholder={"Business Code"}
            />
          )}
          {activeTab === 0 && (
            <div className="flex_end mb-4">
              <div
                className="c-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                <p className="text_primary">Forgot Password?</p>
              </div>
            </div>
          )}
          {((activeTab === 1 && UserType === "employee") ||
            (activeTab === 2 && UserType === "admin")) && (
            <div className="mb-2 d-flex align-items-center">
              <Checkbox
                checked={is_read_terms}
                onClick={() => handleChange("is_read_terms", !is_read_terms)}
              />
              <div className="font-12">
                I have read{" "}
                <span
                  onClick={() => navigate("/terms-conditions")}
                  className="text_primary c-pointer"
                >
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span
                  onClick={() => navigate("/privacy-policy")}
                  className="text_primary c-pointer"
                >
                  Privacy Policy
                </span>
              </div>
            </div>
          )}
          <AppButton
            title={
              activeTab === 2 || (activeTab === 1 && UserType === "employee")
                ? "Sign up"
                : activeTab === 1
                ? "Next"
                : "Login"
            }
            onClick={() =>
              activeTab === 2
                ? handleSignup(true)
                : activeTab === 1
                ? onSubmit()
                : handleLogin()
            }
            loading={loading}
            disabled={
              activeTab === 2
                ? !is_read_terms
                : activeTab === 1
                ? (UserType === "employee" && !is_read_terms) ||
                  !email ||
                  !first_name ||
                  !last_name ||
                  !password ||
                  !phone
                : !email || !password
            }
            backgroundColor={COLORS.primary}
            color={"#fff"}
          />
          {activeTab === 2 && (
            <AppButton
              title={"Back"}
              onClick={() => handleChange("activeTab", 1)}
              backgroundColor={COLORS.white}
              color={COLORS.primary}
            />
          )}
        </div>
      </Grid>
    </Grid>
  )
}
