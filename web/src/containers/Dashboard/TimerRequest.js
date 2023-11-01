// @ts-nocheck
/* eslint-disable no-empty-pattern */
import React, { useEffect, useState } from "react"
import { AppButton, AppInput, Layout } from "../../components"
import {
  Grid,
  Divider,
  CircularProgress,
  Switch,
  Dialog,
  TextField
} from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import AppContext from "../../Context"
import { useContext } from "react"
import { COLORS } from "../../constants"
import { useSnackbar } from "notistack"
import Sample from "../../assets/images/sample.png"
import {
  getAllEmployee,
  getleaveRequest,
  updateLeaveRequest
} from "../../api/business"
import moment from "moment"
import { getSimplifiedError } from "../../utils/error"

export default function TimerRequest({}) {
  const navigate = useNavigate()
  const {} = useContext(AppContext)
  const { enqueueSnackbar } = useSnackbar()
  const location = useLocation()
  const [state, setState] = useState({
    loading: false,
    isDisplay: true,
    loadingApprove: false,
    denyModalVisible: false,
    leaveRequest: [],
    admin_note: "",
    item: null
  })

  const {
    loading,
    leaveRequest,
    loadingApprove,
    denyModalVisible,
    admin_note,
    item
  } = state

  const handleChange = (key, value) => {
    setState(pre => ({
      ...pre,
      [key]: value
    }))
  }

  useEffect(() => {
    _getleaveRequest()
  }, [])

  const _getleaveRequest = async () => {
    try {
      handleChange("loading", true)
      let token = localStorage.getItem("token")
      const res = await getleaveRequest(token)
      handleChange("loading", false)
      handleChange("leaveRequest", res?.data?.results)
    } catch (error) {
      handleChange("loading", false)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        alert(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        alert(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const UpdateRequest = async (id, status) => {
    try {
      handleChange("loadingApprove", true, true)
      const payload = {
        status,
        admin_note
      }
      const token = localStorage.getItem("token")
      await updateLeaveRequest(id, payload, token)
      _getleaveRequest()
      handleChange("loadingApprove", false)
      handleChange("admin_note", "")
      handleChange("leaveItem", null)
      handleChange("denyModalVisible", false)
      // props.navigation.goBack()
      enqueueSnackbar(
        status === "APPROVED"
          ? "Request has been approved"
          : "Request has been denied",
        {
          variant: "success",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right"
          }
        }
      )
    } catch (error) {
      // console.warn("error", error)
      handleChange("loadingApprove", false, true)
      enqueueSnackbar(getSimplifiedError(error), {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    }
  }

  const handleNewClose = status => {
    handleChange("denyModalVisible", status)
  }

  return (
    <div>
      <Layout noFooter>
        <div className="adjustMaxWidth minheight80vh">
          <div className="headingrowBetween">
            <div>
              <div className="heading">Time off Requests</div>
            </div>
          </div>
          <Divider className="mt-4" />
          {loading && (
            <div className="d-flex mt-4 justify-content-center">
              <CircularProgress />
            </div>
          )}
          <Grid
            container
            justifyContent={"space-between"}
            spacing={3}
            className="mt-4"
          >
            {leaveRequest?.map((item, index) => (
              <Grid item md={6} xs={12} key={index}>
                <div>
                  <div className="title">{item?.title}</div>
                  <Grid
                    container
                    justifyContent={"space-between"}
                    spacing={1}
                    className="mt-4"
                  >
                    <Grid item md={6} xs={12}>
                      <div className="titlelist">Employee name:</div>
                      <div className="valuelist">{item?.Employee_name}</div>
                      <div className="titlelist">Date submitted:</div>
                      <div className="valuelist">
                        {moment.utc(item?.created_at).local().fromNow()}
                      </div>
                      <div className="titlelist">Dates requested:</div>
                      <div className="valuelist">
                        {moment
                          .utc(item?.from_date)
                          .local()
                          .format("YYYY-MM-DD") +
                          " - " +
                          moment
                            .utc(item?.to_date)
                            .local()
                            .format("YYYY-MM-DD")}
                      </div>
                      <div className="titlelist">Type of request</div>
                      <div className="valuelist">{item?.request_type}</div>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <div className="titlelist">Description:</div>
                      <div className="valuelist">{item?.description}</div>
                    </Grid>
                  </Grid>
                  <div
                    style={{
                      flexDirection: "row",
                      display: "flex",
                      marginTop: 10,
                      justifyContent: "space-between"
                    }}
                  >
                    <AppButton
                      title={
                        item?.status === "APPROVED" ? "Approved" : "Approve"
                      }
                      backgroundColor={COLORS.primary}
                      disabled={
                        loadingApprove ||
                        item?.status === "APPROVED" ||
                        item?.status === "DENY"
                      }
                      color={COLORS.white}
                      borderRadius={10}
                      className={"mr-2"}
                      onClick={() => UpdateRequest(item?.id, "APPROVED")}
                    />
                    <AppButton
                      title={item?.status === "DENY" ? "Denied" : "Deny"}
                      color={COLORS.primary}
                      borderRadius={10}
                      disabled={
                        loadingApprove ||
                        item?.status === "APPROVED" ||
                        item?.status === "DENY"
                      }
                      onClick={() => {
                        handleChange("denyModalVisible", true)
                        handleChange("item", item)
                      }}
                      borderColor={COLORS.primary}
                      backgroundColor={"transparent"}
                    />
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </Layout>
      <Dialog onClose={() => handleNewClose(false)} open={denyModalVisible}>
        <div className={"zipModal"}>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>Message</p>
          <AppInput
            value={admin_note}
            fullWidth
            id="name"
            placeholder="Reason for denying"
            multiline
            height={100}
            name="admin_note"
            onChange={handleChange}
          />
          <div className=" mt-4">
            <AppButton
              title={"Send"}
              backgroundColor={COLORS.primary}
              disabled={loadingApprove || !admin_note}
              color={COLORS.white}
              borderRadius={10}
              className={"mr-2"}
              onClick={() => UpdateRequest(item?.id, "DENY")}
            />
            <AppButton
              title={"Cancel"}
              backgroundColor={COLORS.white}
              color={COLORS.primary}
              borderColor={COLORS.primary}
              borderRadius={10}
              className={"mt-2"}
              onClick={() => handleNewClose(false)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
