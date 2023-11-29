import React, { useCallback, useContext, useState } from 'react'
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native'
import { BaseComponent, Button } from '../Common'
import { Fonts, Colors } from '../../res'
import DenyModal from './DenyModal'
import moment from 'moment'
import Strings from '../../res/Strings'
import AppContext from '../../Utils/Context'
import { useFocusEffect } from '@react-navigation/native'

const EmpRequestLeave = props => {
  const [refreshing, setRefreshing] = useState(false)
  const { _getleaveRequest } = useContext(AppContext)

  const renderRequestCell = leaveItem => {
    console.log({ leaveItem })
    const data = [
      {
        title: 'Employee name:',
        des: leaveItem?.Employee_name
      },
      {
        title: 'Date submitted:',
        des: moment.utc(leaveItem?.created_at).local().format('MMMM DD, YYYY')
      },
      {
        title: 'Dates requested:',
        des:
          moment.utc(leaveItem?.from_date).local().format('MMM DD, YYYY') +
          ' - ' +
          moment.utc(leaveItem?.to_date).local().format('MMM DD, YYYY')
      },
      {
        title: 'Type of request:',
        des:
          leaveItem?.request_type?.charAt(0) +
          leaveItem?.request_type?.slice(1).toLowerCase()
      },
      {
        title: 'Description:',
        des: leaveItem?.description
      }
    ]
    return (
      <View
        style={{
          flex: 1,
          borderBottomWidth: 1,
          borderColor: Colors.PAYMENT_CELL_BORDER
        }}
      >
        {data.map((item, index) => (
          <View key={index} style={{ marginVertical: 10 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.des}</Text>
          </View>
        ))}
        {renderButtons(leaveItem)}
      </View>
    )
  }

  const renderButtons = leaveItem => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          title={
            leaveItem?.status === 'APPROVED' ? 'Approved' : Strings.approve
          }
          disabled={
            props.loadingApprove ||
            leaveItem?.status === 'APPROVED' ||
            leaveItem?.status === 'DENY'
          }
          style={styles.footerButton}
          onPress={() => props.UpdateRequest(leaveItem?.id, 'APPROVED')}
        />
        <Button
          title={leaveItem?.status === 'DENY' ? 'Denied' : Strings.deny}
          color={Colors.BUTTON_BG}
          style={styles.footerWhiteButton}
          disabled={
            props.loadingApprove ||
            leaveItem?.status === 'APPROVED' ||
            leaveItem?.status === 'DENY'
          }
          onPress={() => {
            props.handleChange('denyModalVisible', true, true)
            props.handleChange('leaveItem', leaveItem, true)
          }}
          isWhiteBg
          textStyle={{ color: Colors.BUTTON_BG }}
        />
      </View>
    )
  }

  useFocusEffect(
    useCallback(() => {
      _getleaveRequest()
    }, [])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    _getleaveRequest()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <DenyModal
        visible={props.denyModalVisible}
        handleChange={props.handleChange}
        UpdateRequest={props.UpdateRequest}
        leaveItem={props.leaveItem}
        admin_note={props.admin_note}
        loadingApprove={props.loadingApprove}
        onRequestClose={() => props.handleChange('denyModalVisible', false)}
      />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={[Colors.BUTTON_BG]}
            tintColor={Colors.BUTTON_BG}
            onRefresh={handleRefresh}
          />
        }
        data={props?.leaveRequest?.sort((a, b) => a.id - b.id).reverse() || []}
        renderItem={({ item }) => renderRequestCell(item)}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default EmpRequestLeave

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  title: {
    ...Fonts.poppinsRegular(12),
    color: Colors.HOME_DES
  },
  childContainer: {
    flex: 1
  },
  footerButton: {
    width: '48%',
    marginVertical: 20,
    height: 40
  },
  footerWhiteButton: {
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG,
    width: '48%',

    marginVertical: 20,
    height: 40
  },
  description: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR,
    textAlign: 'left',
    marginTop: 2
  }
})
