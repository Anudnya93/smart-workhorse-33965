import React, { useEffect, useState } from "react"

import {
  inspectionReports,
  locationVarianceReports,
  payrollReports,
  scheduleVarianceReports
} from "../../api/business"
// import PieChart from "react-native-pie-chart"
import moment from "moment"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getSimplifiedError } from "../../utils/error"
import { Dialog, Divider, Fab } from "@mui/material"
import { AppButton, AppInput, Layout } from "../../components"
import { CloseOutlined } from "@mui/icons-material"
import { COLORS } from "../../constants"
import { useSnackbar } from "notistack"
import { Chart } from "react-google-charts"

export default function ReportsView() {
  const { enqueueSnackbar } = useSnackbar()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const title = searchParams.get("type")
  const token = localStorage.getItem("token")
  const sliceColor = ["#23C263", "#EFF259", "#F84F31"]
  const [state, setState] = useState({
    loading: false,
    visible: false,
    reports: [],
    reportsFiltered: [],
    from: "",
    to: ""
  })

  const { loading, visible, reportsFiltered, reports, from, to } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  useEffect(() => {
    _getReports()
  }, [])

  const _getReportsByFilter = async () => {
    try {
      handleChange("loading", true)
      const payload = `?from=${moment(from).format("YYYY-MM-DD")}&to=${moment(
        to
      ).format("YYYY-MM-DD")}`
      let res
      if (title === "Schedule Variances") {
        res = await scheduleVarianceReports(payload, token)
      } else if (title === "Location Variances") {
        res = await locationVarianceReports(payload, token)
      } else if (title === "Payroll Reports") {
        res = await payrollReports(payload, token)
      } else if (title === "Inspection") {
        res = await inspectionReports(payload, token)
      }
      // if (res?.data) {
      handleChange("reports", res?.data?.results || res?.data?.response)
      // }
      handleChange("reportsFiltered", res?.data?.results || res?.data?.response)
      handleChange("loading", false)
      handleChange("visible", false)
    } catch (error) {
      handleChange("loading", false)
      enqueueSnackbar(getSimplifiedError(error), {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    }
  }

  const _getReports = async () => {
    try {
      handleChange("loading", true)
      let res
      if (title === "Schedule Variances") {
        res = await scheduleVarianceReports("", token)
      } else if (title === "Location Variances") {
        res = await locationVarianceReports("", token)
      } else if (title === "Payroll Reports") {
        res = await payrollReports("", token)
      } else if (title === "Inspection") {
        res = await inspectionReports("", token)
      }
      if (res?.data) {
        handleChange("reports", res?.data?.results || res?.data?.response)
        handleChange(
          "reportsFiltered",
          res?.data?.results || res?.data?.response
        )
      }
      handleChange("loading", false)
    } catch (error) {
      handleChange("loading", false)
      enqueueSnackbar(getSimplifiedError(error), {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        }
      })
    }
  }

  const handleClose = () => {
    _getReports()
    handleChange("visible", false)
  }
  // console.warn("reports", reports)
  const sortBy = type => {
    if (type === "za") {
      const sorted = reports?.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        var dateA = new Date(b.updated_at || b?.created_at).getTime()
        var dateB = new Date(a.updated_at || a?.created_at).getTime()
        return dateA > dateB ? 1 : -1
      })
      handleChange("reportsFiltered", sorted)
    }
    if (type === "az") {
      const sorted = reports?.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        var dateA = new Date(a.updated_at || a?.created_at).getTime()
        var dateB = new Date(b.updated_at || b?.created_at).getTime()
        return dateA > dateB ? 1 : -1
      })
      // console.warn("sorted", sorted)
      handleChange("reportsFiltered", sorted)
    }
  }

  function toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h${minutes > 0 ? ` ${minutes.toFixed(0)}m` : ""}`
  }

  const options = {
    pieHole: 0.73,
    is3D: false,
    colors: sliceColor,
    legend: "none"
  }

  return (
    <div>
      <Layout noFooter>
        <div className="adjustMaxWidth minheight80vh">
          <div className="headingrowBetween">
            <div>
              <div className="heading">{title + " Reports"}</div>
            </div>
            <div className="d-flex">
              {title === "Inspection" && (
                <AppButton
                  backgroundColor={COLORS.primary}
                  color={COLORS.white}
                  width={150}
                  className={"font-normal mr-4"}
                  height={35}
                  borderRadius={10}
                  icon={"filter"}
                  onClick={() => navigate("/reports/inspection/create")}
                  title={"New Report"}
                />
              )}
              <select
                className="selectReport"
                onChange={value => sortBy(value.target.value)}
                placeholder="Sort by"
              >
                <option value={"za"}>Newest</option>
                <option value={"az"}>Oldest</option>
              </select>
              <AppButton
                backgroundColor={COLORS.greyButton}
                color={COLORS.white}
                width={150}
                className={"font-normal"}
                height={35}
                borderRadius={10}
                icon={"filter"}
                onClick={() => handleChange("visible", true)}
                title={"Filter"}
              />
            </div>
          </div>
          <Divider className="mt-4 mb-4" />
          <div style={{ width: "100%" }}>
            {title === "Schedule Variances" && (
              <div style={{ width: "90%", marginBottom: 20, marginTop: 20 }}>
                <div>{"Totals"}</div>
                <div>{"Actual Shift Duration:"}</div>
                <div>{"Scheduled Shift Duration:"}</div>
                <div>{"Variance:"}</div>
              </div>
            )}
            <table>
              <tr>
                {title === "Schedule Variances" && (
                  <>
                    <th>Variance Type</th>
                    <th>Employee</th>
                    <th>Worksite</th>
                    <th>Actual Time</th>
                    <th>Edited Time</th>
                    <th>Actual Shift Duration</th>
                    <th>Scheduled Shift Duration</th>
                    <th>Variance</th>
                    <th>Date</th>
                  </>
                )}
                {title === "Payroll Reports" && (
                  <>
                    <th>{"Employee Name:"}</th>
                    <th>Total Hours</th>
                    <th>Total Compensation</th>
                    <th>Date</th>
                  </>
                )}
                {title === "Location Variances" && (
                  <>
                    <th>{"Clock in/out"}</th>
                    <th>Employee</th>
                    <th>Worksite</th>
                    <th>Actual Time</th>
                    <th>Actual Location</th>
                    <th>Worksite Location</th>
                    <th>Distance Deviation</th>
                    <th>Date</th>
                  </>
                )}
                {title === "Inspection" && (
                  <>
                    <th>{"Inspector"}</th>
                    <th>Worksite</th>
                    <th>Inspection Report Name</th>
                    <th></th>
                    <th>Date</th>
                  </>
                )}
              </tr>

              {reportsFiltered?.map((item, index) => (
                <tr key={index}>
                  {title === "Inspection" && (
                    <>
                      <td>{item?.inspector}</td>
                      <td>{item?.worksite?.name}</td>
                      <td>{item?.name}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {Number(item?.stats?.SATISFACTORY) > 0 ||
                          Number(item?.stats?.NEEDS_ATTENTION) > 0 ||
                          Number(item?.stats?.UNSATISFACTORY) > 0 ? (
                            <Chart
                              chartType="PieChart"
                              width="50px"
                              height="50px"
                              options={options}
                              data={[
                                ["Task", "Hours per Day"],
                                [
                                  "SATISFACTORY",
                                  item?.stats?.SATISFACTORY
                                    ? Number(item?.stats?.SATISFACTORY)
                                    : 0
                                ],
                                [
                                  "NEEDS_ATTENTION",
                                  item?.stats?.NEEDS_ATTENTION
                                    ? Number(item?.stats?.NEEDS_ATTENTION)
                                    : 0
                                ],
                                [
                                  "UNSATISFACTORY",
                                  item?.stats?.UNSATISFACTORY
                                    ? Number(item?.stats?.UNSATISFACTORY)
                                    : 0
                                ]
                              ]}
                            />
                          ) : (
                            <div style={{ width: 50 }} />
                          )}
                          <div
                            onClick={() =>
                              navigate(`/reports/inspection/${item?.id}`)
                            }
                            className="text_primary c-pointer"
                          >
                            {"See Report"}
                          </div>
                        </div>
                      </td>
                      <td>
                        {(item?.created_at || item?.updated_at) &&
                          moment
                            .utc(item?.updated_at || item?.created_at)
                            .local()
                            .fromNow()}
                      </td>
                    </>
                  )}
                  {title === "Payroll Reports" && (
                    <>
                      <td>{item?.employee?.name}</td>
                      <td>{item?.total_hours}</td>
                      <td>{"$" + item?.earnings}</td>
                      <td>
                        {(item?.created_at || item?.updated_at) &&
                          moment
                            .utc(item?.updated_at || item?.created_at)
                            .local()
                            .format("LL")}
                      </td>
                    </>
                  )}
                  {title === "Location Variances" && (
                    <>
                      <td>
                        {moment
                          .utc(item?.clockin)
                          .local()
                          .format("YYYY/MM/DD hh:mm")}
                      </td>
                      <td>{item?.employee}</td>
                      <td>{item?.worksite}</td>
                      <td>
                        {item?.actual_time
                          ? moment
                              .utc(item?.actual_time)
                              .local()
                              .format("YYYY/MM/DD hh:mm")
                          : "-"}
                      </td>
                      <td className="text_primary">{item?.actual_location}</td>
                      <td className="text_primary">
                        {item?.worksite_location}
                      </td>
                      <td className="text_primary">
                        {Number(item?.distance_deviation).toFixed(2)}Miles
                      </td>
                      <td>
                        {(item?.created_at || item?.updated_at) &&
                          moment
                            .utc(item?.updated_at || item?.created_at)
                            .local()
                            .fromNow()}
                      </td>
                    </>
                  )}
                  {title === "Schedule Variances" && (
                    <>
                      <td>{"Late Clock in"}</td>
                      <td>{item?.employee}</td>
                      <td>{item?.worksite}</td>
                      <td>{item?.actual_time}</td>
                      <td>{item?.edited_time}</td>
                      <td>{toHoursAndMinutes(item?.actual_shift_duration)}</td>
                      <td>
                        {toHoursAndMinutes(item?.scheduled_shift_duration)}
                      </td>
                      <td>{toHoursAndMinutes(item?.variance)}</td>
                      <td>
                        {(item?.created_at || item?.updated_at) &&
                          moment
                            .utc(item?.updated_at || item?.created_at)
                            .local()
                            .format("LL")}
                      </td>
                    </>
                  )}
                  {/* <td style={{ marginBottom: 10, marginTop: 10 }}>
                    <div
                      style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-between"
                      }}
                    >
                      {title === "Schedule Variances" ? (
                        <div>{"Late Clock in"}</div>
                      ) : (
                        <div />
                      )}
                      <div>
                        {(item?.created_at || item?.updated_at) &&
                          moment
                            .utc(item?.updated_at || item?.created_at)
                            .local()
                            .fromNow()}
                      </div>
                    </div>
                    <div>
                      {title === "Location Variances" ||
                      title === "Schedule Variances"
                        ? item?.employee
                        : title === "Inspection"
                        ? item?.worksite?.name
                        : item?.employee?.name}
                    </div>
                  </td>
                  {title === "Schedule Variances" && (
                    <>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Worksite:"}</div>
                        <div>{item?.worksite}</div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Actual Time:"}</div>
                        <div>{item?.actual_time}</div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Edited Time:"}</div>
                        <div>{item?.edited_time}</div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Actual Shift Duration:"}</div>
                        <div>
                          {toHoursAndMinutes(item?.actual_shift_duration)}
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Scheduled Shift Duration:"}</div>
                        <div>
                          {toHoursAndMinutes(item?.scheduled_shift_duration)}
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Variance:"}</div>
                        <div>{item?.variance}</div>
                      </div>
                    </>
                  )}
                  {title === "Location Variances" && (
                    <>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Worksite:"}</div>
                        <div>{item?.worksite}</div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Actual Time:"}</div>
                        <div>
                          {moment
                            .utc(item?.actual_time)
                            .local()
                            .format("YYYY/MM/DD hh:mm")}
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Actual Location:"}</div>
                        <div>
                          {item?.actual_location}
                          <div> - Map</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Worksite Location:"}</div>
                        <div>
                          {item?.worksite_location}
                          <div> - Map</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, marginTop: 10 }}>
                        <div>{"Distance Deviation:"}</div>
                        <div>
                          {Number(item?.distance_deviation).toFixed(2)}Miles
                          <div> - Map</div>
                        </div>
                      </div>
                    </>
                  )}
                  {title !== "Schedule Variances" &&
                    title !== "Location Variances" && (
                      <>
                        <div style={{ marginBottom: 10, marginTop: 10 }}>
                          <div
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              justifyContent: "space-between"
                            }}
                          >
                            <div>
                              <div>
                                {title === "Inspection"
                                  ? "Inspection Report Name:"
                                  : "Total Hours:"}
                              </div>
                              {
                                <div>
                                  {title === "Inspection"
                                    ? item?.name
                                    : item?.total_hours}
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ marginBottom: 10, marginTop: 10 }}>
                          <div
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              justifyContent: "space-between"
                            }}
                          >
                            <div>
                              <div>
                                {title === "Inspection"
                                  ? "Inspector"
                                  : "Total Compensation:"}
                              </div>
                              <div>
                                {title === "Inspection"
                                  ? item?.inspector
                                  : "$" + item?.earnings}
                              </div>
                            </div>
                            {title === "Inspection" && (
                              <div
                                onPress={() =>
                                  navigate("/InspectionDetails", {
                                    item
                                  })
                                }
                              >
                                <div>{"See Report"}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )} */}
                </tr>
              ))}
            </table>
          </div>
        </div>
      </Layout>
      <Dialog open={visible} onClose={handleClose}>
        <div className="zipModal">
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <CloseOutlined onClick={handleClose} />
            </div>
            <div className="heading1">Filter</div>

            <div
              style={{
                flexDirection: "row",
                alignItems: "center",
                display: "flex",
                width: "100%",
                justifyContent: "space-between"
              }}
            >
              <div style={{ width: "48%" }}>
                <AppInput
                  dateType={true}
                  value={from}
                  max={new Date("2050/01/01")}
                  name="from"
                  type={"date"}
                  placeholder="From"
                  onChange={handleChange}
                />
              </div>
              <div style={{ width: "48%" }}>
                <AppInput
                  dateType={true}
                  max={new Date("2050/01/01")}
                  value={to}
                  name="to"
                  type={"date"}
                  placeholder="To"
                  onChange={handleChange}
                />
              </div>
            </div>
            <AppButton
              style={{ height: 40, marginTop: 20, width: "95%" }}
              onClick={_getReportsByFilter}
              disabled={!from || !to}
              // loading={loadingFeedback}
              backgroundColor={COLORS.primary}
              color={COLORS.white}
              className={"mt-3 mb-3"}
              title={"Apply filter"}
            />
            <AppButton
              style={{ height: 40 }}
              onClick={handleClose}
              isWhiteBg
              color={COLORS.primary}
              backgroundColor={"transparent"}
              title={"Cancel"}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
