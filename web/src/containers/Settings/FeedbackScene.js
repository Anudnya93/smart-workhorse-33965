import React, { useRef, useState } from "react"
import { appFeedback } from "../../api/auth"
import { AppButton, AppInput, Layout } from "../../components"
import { useSnackbar } from "notistack"
import { useNavigate } from "react-router-dom"
import { Divider, Grid } from "@mui/material"
import { COLORS } from "../../constants"

export default function Feedback({}) {
  const { enqueueSnackbar } = useSnackbar()
  const fileRef = useRef()
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [state, setState] = useState({
    email: "",
    message: "",
    file: "",
    loading: false
  })
  const { email, message, file, loading } = state

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }))
  }

  const handleUploadClick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = e => {
    if (!e.target.files) {
      return
    }
    var reader = new FileReader()
    var file = e.target.files[0]
    reader.readAsDataURL(file)
    reader.onload = e => {
      handleChange("file", e.target.result)
    }
  }

  const onSubmit = async () => {
    try {
      handleChange("loading", true)
      const payload = {
        email,
        message,
        files: { file01: file }
      }
      await appFeedback(payload, token)
      handleChange("loading", false)
      navigate(-1)
      enqueueSnackbar(`App feedback submitted`, {
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
              <div className="heading">Send App Feedback</div>
            </div>
          </div>
          <Divider className="mt-4 mb-4" />
          <Grid container>
            <Grid item md={12}>
              <AppInput
                className="mb-4 mt-3"
                value={email}
                name={"email"}
                onChange={handleChange}
                placeholder={"Email address"}
              />
              <AppInput
                className="mb-4 mt-3"
                value={message}
                multiline
                height={100}
                name={"message"}
                onChange={handleChange}
                placeholder={"Message"}
              />
              <Grid container justifyContent={"flex-end"}>
                <Grid item md={4}>
                  <AppButton
                    title={"Upload photo/screenshot"}
                    borderRadius={10}
                    onClick={handleUploadClick}
                    borderColor={COLORS.primary}
                    backgroundColor={COLORS.white}
                    className={"mb-3"}
                    color={COLORS.primary}
                  />
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <AppButton
                    title={"Submit"}
                    borderRadius={10}
                    onClick={onSubmit}
                    loading={loading}
                    backgroundColor={COLORS.primary}
                    color={COLORS.white}
                    disabled={!email || !message || !file}
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
