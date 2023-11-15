import React, { useState } from "react"
import { _changePassword } from "../../api/auth"
import { AppButton, AppInput, Layout } from "../../components"
import { useSnackbar } from "notistack"
import { useNavigate } from "react-router-dom"
import eyeIcon from "../../assets/svg/eye.svg"
import eyeCLose from "../../assets/images/closeEYE.jpg"
import { Divider, Grid } from "@mui/material"
import { COLORS } from "../../constants"

export default function ChangePassword({}) {
  const { enqueueSnackbar } = useSnackbar()
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [state, setState] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
    isShow: false,
    isShow1: false,
    isShow2: false,
    loading: false
  })

  const {
    oldPassword,
    password,
    confirmPassword,
    loading,
    isShow,
    isShow1,
    isShow2
  } = state

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  const onSubmit = async () => {
    try {
      handleChange("loading", true)
      const payload = {
        old_password: oldPassword,
        new_password1: password,
        new_password2: confirmPassword
      }
      await _changePassword(payload, token)
      handleChange("loading", false)
      navigate(-1)
      enqueueSnackbar(`Password has been changed`, {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    } catch (error) {
      // console.warn("error", error)
      handleChange("loading", false)
      enqueueSnackbar(`Error: ${error.message}`, {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    }
  }

  return (
    <div>
      <Layout noFooter>
        <div className="adjustMaxWidth minheight80vh">
          <div className="headingrowBetween">
            <div>
              <div className="heading">Change Password</div>
            </div>
          </div>
          <Divider className="mt-4 mb-4" />
          <Grid container>
            <Grid item md={6}>
              <AppInput
                className="mb-4 mt-3"
                value={oldPassword}
                autoComplete={"new-password"}
                type={isShow1 ? "text" : "password"}
                name={"oldPassword"}
                onChange={handleChange}
                postfix={
                  <img
                    src={isShow1 ? eyeIcon : eyeCLose}
                    style={{ objectFit: "contain" }}
                    onClick={() => handleChange("isShow1", !isShow1)}
                    width={20}
                    className={"c-pointer"}
                  />
                }
                placeholder={"Current Password"}
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
                placeholder={"New Password"}
              />
              <AppInput
                className="mb-4 mt-3"
                value={confirmPassword}
                type={isShow2 ? "text" : "password"}
                name={"confirmPassword"}
                onChange={handleChange}
                postfix={
                  <img
                    src={isShow2 ? eyeIcon : eyeCLose}
                    style={{ objectFit: "contain" }}
                    onClick={() => handleChange("isShow2", !isShow2)}
                    width={20}
                    className={"c-pointer"}
                  />
                }
                placeholder={"Confirm Password"}
              />
              <Grid container justifyContent={"flex-end"}>
                <Grid item md={8}>
                  <AppButton
                    title={"Change Password"}
                    borderRadius={10}
                    onClick={onSubmit}
                    loading={loading}
                    backgroundColor={COLORS.primary}
                    color={COLORS.white}
                    disabled={
                      !oldPassword || !password || password !== confirmPassword
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Layout>
    </div>
  )
}
