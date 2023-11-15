import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { Header, Button } from '../Common'
import { Colors, Fonts } from '../../res'
import PrimaryTextInput from '../Common/PrimaryTextInput'
import Strings from '../../res/Strings'
import Toast from 'react-native-simple-toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteWorksite } from '../../api/business'
export default function WorksiteDetailScene({ navigation, route }) {
  const worksiteData = route?.params?.item
  const [state, setState] = useState({
    loading: false,
    info: [
      {
        title: 'Worksite Name:',
        description: worksiteData?.personal_information?.name
      },
      {
        title: 'Worksite Location:',
        description: worksiteData?.personal_information?.location
      },
      {
        title: 'Description:',
        description: worksiteData?.personal_information?.description
      },
      {
        title: 'Notes:',
        description: worksiteData?.personal_information?.notes
      },
      {
        title: 'Monthly rate:',
        description: '$ ' + worksiteData?.personal_information?.monthly_rates
      },
      {
        title: 'Cleaning rate by day:',
        description:
          worksiteData?.personal_information?.clear_frequency_by_day?.toString()
      },
      {
        title: 'Designated start time:',
        description: worksiteData?.personal_information?.desired_time
      },
      {
        title: 'Number of workers needed:',
        description:
          worksiteData?.personal_information?.number_of_workers_needed
      }
    ]
  })

  const { info, loading } = state

  const handleChange = (name, value) => {
    setState(pre => ({ ...pre, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      handleChange('loading', true)
      const token = await AsyncStorage.getItem('token')
      await deleteWorksite(worksiteData?.id, token)
      handleChange('loading', false)
      navigation.goBack()
      Toast.show('Worksite has been deleted!')
    } catch (error) {
      handleChange('loading', false)
      // console.warn('err', error?.response?.data)
      const showWError = Object.values(error.response?.data?.error)
      if (showWError.length > 0) {
        Toast.show(`Error: ${JSON.stringify(showWError[0])}`)
      } else {
        Toast.show(`Error: ${JSON.stringify(error)}`)
      }
    }
  }

  const renderButtons = () => {
    return (
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
        <Button
          onPress={() => navigation.navigate('createTask', { worksiteData })}
          style={styles.footerButton}
          title={Strings.createTask}
        />
        <Button
          style={[styles.footerWhiteButton]}
          onPress={() => navigation.navigate('addWorksite', { worksiteData })}
          title={Strings.edit}
          icon={'edit'}
          isWhiteBg
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          color={Colors.BUTTON_BG}
        />
        <Button
          style={[styles.footerWhiteButton]}
          isWhiteBg
          icon={'delete'}
          loading={loading}
          onPress={handleSubmit}
          color={Colors.BUTTON_BG}
          iconStyle={{
            width: 20,
            height: 20,
            tintColor: Colors.GREEN_COLOR,
            resizeMode: 'contain'
          }}
          title={Strings.deleteWorksite}
        />
      </View>
    )
  }

  const renderWorksiteInfo = () => {
    return (
      <View style={styles.childContainer}>
        <Text style={styles.title}>{Strings.worksiteInfo}</Text>
        {info.map((item, index) => {
          return (
            <View key={index} style={styles.cellContainer}>
              <Text style={styles.description}>{item.title}</Text>
              <Text style={styles.cellTitle}>{item.description}</Text>
              {/* {item.title.includes('day') && (
                <PrimaryTextInput
                  style={{ width: '120%', alignItems: 'flex-end' }}
                  dropdown
                  items={[{ value: 'Sunday', label: 'Sunday' }]}
                />
              )} */}
            </View>
          )
        })}
      </View>
    )
  }

  const renderContactInfo = () => {
    return (
      <View style={styles.childContainer}>
        <Text style={styles.title}>{Strings.contactInfo}</Text>
        <View style={styles.cellContainer}>
          <Text style={styles.description}>{'Name'}</Text>
          <Text style={styles.cellTitle}>
            {worksiteData?.contact_person?.contact_person_name}
          </Text>
        </View>
        <View style={styles.cellContainer}>
          <Text style={styles.description}>{'Phone number:'}</Text>
          <Text style={styles.cellTitle}>
            {worksiteData?.contact_person?.contact_phone_number}
          </Text>
        </View>
        <Text style={styles.title}>Tasks</Text>
        {worksiteData?.tasks?.map((task, index) => (
          <View
            key={index}
            style={[
              {
                width: '110%',
                borderBottomWidth: 1,
                borderBottomColor: Colors.MESSAGEB_BOX_LIGHT,
                paddingBottom: 5,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }
            ]}
          >
            <View style={{ width: '70%', marginRight: 10 }}>
              <Text style={styles.cellTitle}>{task?.name}</Text>
            </View>
            <TouchableOpacity
              style={{ justifyContent: 'flex-end' }}
              onPress={() =>
                navigation.navigate('createTask', { worksiteData, task })
              }
            >
              <Text
                style={[
                  styles.cellTitle,
                  { color: Colors.BLUR_TEXT, ...Fonts.poppinsRegular(13) }
                ]}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )
  }

  const renderContent = () => {
    return (
      <ScrollView
        style={{ width: '100%', height: '100%' }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={styles.childContainer}>
          {renderWorksiteInfo()}
          {renderContactInfo()}
          {renderButtons()}
        </View>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <Header
        onLeftPress={() => navigation.goBack()}
        title={worksiteData?.personal_information?.name}
        leftButton
      />
      {renderContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: Colors.WHITE
  },
  title: {
    ...Fonts.poppinsMedium(22),
    color: Colors.TEXT_COLOR,
    marginBottom: 10,
    marginTop: 20
  },
  childContainer: {
    width: '90%'
  },
  footerButton: {
    marginTop: '5%',
    width: '100%'
  },
  footerWhiteButton: {
    marginTop: '5%',
    width: '100%',
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: Colors.BUTTON_BG
  },
  description: {
    ...Fonts.poppinsRegular(12),
    color: '#818080',
    textAlign: 'left',
    marginTop: 10
  },
  cellContainer: {
    marginVertical: 10,
    width: '100%'
  },
  cellTitle: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_COLOR
  }
})
