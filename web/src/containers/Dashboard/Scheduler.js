// @ts-nocheck
/* eslint-disable no-empty-pattern */
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AppButton, AppInput, Layout } from "../../components"
import {
  Grid,
  Divider,
  CircularProgress,
  Switch,
  Dialog,
  TextField,
  Fab
} from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import AppContext from "../../Context"
import { useContext } from "react"
import { COLORS } from "../../constants"
import { useSnackbar } from "notistack"
import Sample from "../../assets/images/sample.png"
import {
  getAllEmployee,
  getAllSchedules,
  publishAllEvent,
  updateLeaveRequest
} from "../../api/business"
import moment from "moment"
import { getSimplifiedError } from "../../utils/error"
import FullCalendar from "@fullcalendar/react" // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid" // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid"
import { Calendar, Views, momentLocalizer } from "react-big-calendar"
import DRAFTED from "../../assets/svg/drafted.svg"
import calendarLogo from "../../assets/images/calendarLogo.png"
import userProfile from "../../assets/images/sample.png"
import { Add } from "@mui/icons-material"

// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"

export default function Scheduler({}) {
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const isEmp = user?.role !== "Organization Admin"
  const localizer = momentLocalizer(moment)
  const { enqueueSnackbar } = useSnackbar()
  const [view, setView] = useState(Views.MONTH)
  const UserType = localStorage.getItem("UserType")
  const location = useLocation()
  const token = localStorage.getItem("token")
  const [state, setState] = useState({
    loading: false,
    loadingPublish: false,
    isDisplay: true,
    loadingApprove: false,
    visible: false,
    schedules: [],
    admin_note: "",
    item: null
  })

  const {
    loading,
    schedules,
    loadingApprove,
    visible,
    admin_note,
    item,
    loadingPublish,
    selectedEvent
  } = state

  const handleChange = (key, value) => {
    setState(pre => ({
      ...pre,
      [key]: value
    }))
  }

  useEffect(() => {
    _getAllSchedules("")
  }, [])

  const _getAllSchedules = async payload => {
    try {
      handleChange("loading", true)
      const qs = payload || ""
      let token = localStorage.getItem("token")
      const res = await getAllSchedules(qs, token)
      handleChange("loading", false)
      handleChange("schedules", res?.data?.response)
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

      await updateLeaveRequest(id, payload, token)
      _getAllSchedules()
      handleChange("loadingApprove", false)
      handleChange("admin_note", "")
      handleChange("leaveItem", null)
      handleChange("visible", false)
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

  const _publishAllEvent = async () => {
    try {
      handleChange("loadingPublish", true)
      await publishAllEvent(token)
      _getAllSchedules("")
      enqueueSnackbar(`All events has been published`, {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
      handleChange("loadingPublish", false)
    } catch (error) {
      handleChange("loadingPublish", false)
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
    handleChange("visible", status)
  }

  const getEvents = events => {
    if (events?.length > 0) {
      const list = []
      events?.forEach(element => {
        if (element?.start_time) {
          list.push({
            ...element,
            title: element?.worksite_name,
            color: element?.color || "#FDB48B",
            event_status: element?.event_status,
            start: new Date(moment.utc(element?.start_time).local()),
            end: moment.utc(element?.end_time).local()
          })
        }
      })
      return list || []
    } else {
      return []
    }
  }

  const renderEventContent = eventInfo => {
    const event = eventInfo?.event?._def?.extendedProps
    console.log("event", event)
    return (
      <div style={{ backgroundColor: "#fff", width: "100%" }}>
        <div
          style={{
            height: 30,
            cursor: "pointer",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 5,
            justifyContent: "center",
            textAlign: "center",
            borderRadius: 0,
            width: "100%",
            backgroundColor: event?.color
          }}
        >
          <div
            style={{
              flexDirection: "column",
              width: "100%",
              display: "flex"
            }}
          >
            <div>
              <b style={{ color: "#fff", fontSize: 14 }}>${event?.title}</b>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { views } = useMemo(
    () => ({
      views: [Views.MONTH, Views.WEEK, Views.DAY]
    }),
    []
  )

  const onView = useCallback(newView => setView(newView), [setView])

  const eventPropGetter = useCallback(
    (event, start, end, isSelected) => ({
      ...{
        style: {
          backgroundColor: event?.color,
          color: "#000"
        }
      },
      ...(moment(start).hour() < 12 && {
        className: "powderBlue"
      }),
      ...(event.title.includes("Meeting") && {
        className: "darkGreen"
      })
    }),
    []
  )

  return (
    <div>
      <Layout noFooter>
        <div className="adjustMaxWidth minheight80vh">
          <div className="headingrowBetween">
            <div>
              <div className="heading">Scheduler</div>
            </div>
            <div className="column">
              <AppButton
                backgroundColor={COLORS.greyButton}
                color={COLORS.white}
                className={"mb-2"}
                height={35}
                width={150}
                borderRadius={10}
                // onClick={() => navigate("/employees/add")}
                title={"Filter"}
              />
              {!isEmp && (
                <AppButton
                  backgroundColor={COLORS.greyButton}
                  color={COLORS.white}
                  height={35}
                  width={150}
                  borderRadius={10}
                  loading={loadingPublish}
                  onClick={_publishAllEvent}
                  title={"Publish All"}
                />
              )}
            </div>
          </div>
          <Divider className="mt-4" />
          {loading && (
            <div className="d-flex mt-4 justify-content-center">
              <CircularProgress />
            </div>
          )}
          <Grid className="p-4">
            <Calendar
              localizer={localizer}
              events={getEvents(schedules)}
              titleAccessor={event => (
                <>
                  {view === Views.MONTH ? (
                    <div
                      onClick={() => {
                        handleChange("visible", true)
                        handleChange("selectedEvent", event)
                      }}
                      style={{
                        display: "flex",
                        flexDirection: view === Views.MONTH ? "row" : "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <img
                        src={event?.logo ? event?.logo : calendarLogo}
                        style={{
                          width: 20,
                          height: 20
                        }}
                      />
                      <div
                        style={{
                          fontSize: view === Views.MONTH ? 12 : 14
                        }}
                      >
                        {event?.title}
                      </div>
                      {event?.event_status === "DRAFT" ? (
                        <div className="">
                          <img src={DRAFTED} className="drafted" />
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        handleChange("visible", true)
                        handleChange("selectedEvent", event)
                      }}
                      style={{
                        display: "flex",
                        flexDirection: view === Views.MONTH ? "row" : "column"
                      }}
                    >
                      {event?.event_status !== "DRAFT" && (
                        <div className="draftedView">
                          <img src={DRAFTED} className="drafted" />
                        </div>
                      )}
                      <img
                        src={event?.logo ? event?.logo : calendarLogo}
                        style={{
                          width: 50,
                          height: 50
                        }}
                      />
                      <div
                        style={{
                          fontSize: view === Views.MONTH ? 12 : 14
                        }}
                      >
                        {event?.title}
                      </div>
                    </div>
                  )}
                </>
              )}
              eventPropGetter={eventPropGetter}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              views={views}
              onView={onView}
              view={view}
            />
          </Grid>
        </div>
      </Layout>
      <Dialog onClose={() => handleNewClose(false)} open={visible}>
        <div className={"eventModal"}>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>
            {selectedEvent?.title}
          </p>
          <div style={{ marginBottom: 20 }}>
            Scheduled Date:{" "}
            {moment
              .utc(selectedEvent?.start_time)
              .local()
              .format("YYYY-MM-DD h:mm:A")}
          </div>
          <div className="d-flex justify-content-between">
            <div className={!isEmp ? "maxHeight400" : "maxHeight400FullW"}>
              <div className="heading1">{"Tasks"}</div>
              {selectedEvent?.selected_tasks?.map((task, index) => (
                <div
                  key={index}
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    marginVertical: 10,
                    alignItems: "center",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${COLORS.borderColor}`
                  }}
                >
                  <div>{task?.name}</div>
                </div>
              ))}
            </div>
            {!isEmp && (
              <div>
                <Divider orientation="vertical" />
              </div>
            )}
            {!isEmp && (
              <div className="maxHeight400">
                <div className="">
                  <div className="heading1">{"Assigned Employees"}</div>
                  {selectedEvent?.employees?.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        display: "flex",
                        marginBottom: 20,
                        borderBottomWidth: 1,
                        paddingBottom: 10,
                        borderBottomColor: COLORS.greyButton
                      }}
                    >
                      <img
                        src={
                          item?.profile_image
                            ? item?.profile_image
                            : userProfile
                        }
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 10,
                          marginRight: 20
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 12 }}>
                          {item?.user?.first_name + " " + item?.user?.last_name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: COLORS.greyButton
                          }}
                        >
                          Phone Number:{item?.mobile}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {!isEmp && (
            <Grid container className="mt-4" justifyContent={"flex-end"}>
              <Grid item md={6}>
                <AppButton
                  // style={[styles.footerWhiteButton]}
                  onClick={() => {
                    navigate(`/event/edit/${selectedEvent?.id}`)
                    handleNewClose(false)
                  }}
                  backgroundColor={COLORS.white}
                  borderColor={COLORS.primary}
                  color={COLORS.primary}
                  title={"Edit"}
                />
              </Grid>
            </Grid>
          )}
        </div>
      </Dialog>
      {UserType === "admin" && (
        <Fab
          onClick={() => navigate("/event/add")}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            color: "#fff",
            backgroundColor: "#06726A",
            "&:hover": {
              backgroundColor: "#06726A"
            }
          }}
          aria-label={"Add"}
        >
          <Add />
        </Fab>
      )}
    </div>
  )
}
