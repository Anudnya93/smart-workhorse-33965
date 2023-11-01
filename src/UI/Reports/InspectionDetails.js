import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { Header } from '../Common'
import { Fonts, Images, Colors } from '../../res'
import { Button } from '../Common'
import { Divider, Icon } from 'react-native-elements'
import { FlatList } from 'react-native'
import PieChart from 'react-native-pie-chart'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createFeedback } from '../../api/business'
import Toast from 'react-native-simple-toast'

export default function InspectionDetails({ navigation, route }) {
  const item = route.params?.item
  const series = [123, 321, 123]
  const sliceColor = ['#23C263', '#EFF259', '#F84F31']
  const [state, setState] = useState({
    loading: false,
    visible: false,
    task: '',
    taskIndex: '',
    selectedFeedback: '',
    loadingFeedback: false
  })

  const {
    loading,
    visible,
    task,
    loadingFeedback,
    taskIndex,
    selectedFeedback
  } = state
  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const feedback = [
    { name: 'Satisfactory', value: 'SATISFACTORY', color: '#23C263' },
    { name: 'Needs Attention', value: 'NEEDS_ATTENTION', color: '#EFF259' },
    { name: 'Unsatisfactory', value: 'UNSATISFACTORY', color: '#F84F31' }
  ]

  const handleClose = () => {
    handleChange('visible', false)
    handleChange('selectedFeedback', '')
    handleChange('taskIndex', '')
  }

  const _createFeedback = async () => {
    try {
      handleChange('loadingFeedback', true)
      const token = await AsyncStorage.getItem('token')
      const payload = {
        feedback: selectedFeedback,
        tasks: task,
        report: item?.id
      }
      await createFeedback(payload, token)
      handleClose()
      handleChange('task', '')
      handleChange('selectedFeedback', '')
      navigation.goBack()
    } catch (error) {
      handleChange('loadingFeedback', false)
      // console.warn("err", error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  // console.warn('item?.stats', item?.tasks)
  return (
    <View style={styles.container}>
      <Header
        back
        leftButton
        title={'Create Inspection Report'}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ width: '100%' }}
      >
        <View style={{ width: '90%', marginTop: 20 }}>
          <Text style={styles.title}>{'Inspection report name:'}</Text>
          <Text style={styles.description}>{item?.name}</Text>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              marginTop: 20,
              justifyContent: 'space-between'
            }}
          >
            <View>
              <Text style={[styles.title]}>{'Worksite name:'}</Text>
              <Text style={styles.description}>{item?.worksite?.name}</Text>
            </View>
            {(Number(item?.stats?.SATISFACTORY) > 0 ||
              Number(item?.stats?.NEEDS_ATTENTION) > 0 ||
              Number(item?.stats?.UNSATISFACTORY) > 0) && (
              <PieChart
                widthAndHeight={60}
                doughnut={true}
                coverRadius={0.83}
                series={[
                  item?.stats?.SATISFACTORY
                    ? Number(item?.stats?.SATISFACTORY)
                    : 0,
                  item?.stats?.NEEDS_ATTENTION
                    ? Number(item?.stats?.NEEDS_ATTENTION)
                    : 0,
                  item?.stats?.UNSATISFACTORY
                    ? Number(item?.stats?.UNSATISFACTORY)
                    : 0
                ]}
                sliceColor={sliceColor}
              />
            )}
          </View>
          <Text style={styles.title}>Tasks:</Text>
          <FlatList
            data={item?.tasks}
            renderItem={({ item: task, index }) => (
              <View key={index} style={{ width: '100%', marginVertical: 20 }}>
                <View style={{ width: '100%' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={styles.description}>{task?.tasks}</Text>
                    {task?.feedback ? (
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 15,
                          backgroundColor: feedback.find(
                            e => e.value === task.feedback
                          ).color
                        }}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          handleChange('visible', true)
                          handleChange('task', task?.id)
                          handleChange('taskIndex', task?.tasks)
                        }}
                      >
                        <Text
                          style={{
                            ...Fonts.poppinsRegular(12),
                            color: Colors.BLUR_TEXT
                          }}
                        >
                          {'Review'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* {area?.tasks?.length < index + 1 && <Divider />} */}
                </View>
                {/* ))} */}
                <Divider />
              </View>
            )}
          />
          <Text style={[styles.title]}>Media Links:</Text>
          {item?.media?.map((task, index) => (
            <View style={{ width: '100%' }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <Text
                  style={[styles.description, { color: Colors.BACKGROUND_BG }]}
                >
                  Photo {index + 1}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={visible}
        transparent
        onDismiss={handleClose}
        onRequestClose={handleClose}
      >
        <View style={styles.centerMode}>
          <View style={styles.modal}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={handleClose}>
                <Icon name="close" type="antdesign" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.description, { ...Fonts.poppinsRegular(18) }]}>
              {taskIndex}
            </Text>
            {feedback?.map(feed => (
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  marginTop: 10,
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    width: '90%',
                    marginTop: 10,
                    alignItems: 'center'
                  }}
                >
                  <BouncyCheckbox
                    size={20}
                    fillColor={Colors.BACKGROUND_BG}
                    disableBuiltInState
                    iconStyle={{
                      borderColor: Colors.BLACK,
                      borderRadius: 1,
                      marginBottom: 2
                    }}
                    onPress={() => {
                      if (feed?.value === selectedFeedback) {
                        handleChange('selectedFeedback', '')
                      } else {
                        handleChange('selectedFeedback', feed?.value)
                      }
                    }}
                    isChecked={selectedFeedback === feed?.value}
                  />
                  <Text
                    style={[
                      styles.description,
                      { ...Fonts.poppinsRegular(12) }
                    ]}
                  >
                    {feed?.name}
                  </Text>
                </View>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: feed?.color,
                    borderRadius: 15
                  }}
                />
              </View>
            ))}
            <Button
              style={{ height: 40, marginTop: 20 }}
              onPress={_createFeedback}
              disabled={!selectedFeedback}
              loading={loadingFeedback}
              title={'Save'}
            />

            <Button
              style={{ height: 40 }}
              onPress={handleClose}
              isWhiteBg
              color={Colors.GREEN_COLOR}
              backgroundColor={'transparent'}
              title={'Cancel'}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE
  },

  title: {
    ...Fonts.poppinsRegular(12),
    color: Colors.HOME_DES
  },
  childContainer: {
    flex: 1,
    padding: 20
  },
  footerButton: {
    marginTop: '15%'
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 2
  },
  centerMode: {
    backgroundColor: Colors.MODAL_BG,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 20,
    width: '90%'
  }
})
