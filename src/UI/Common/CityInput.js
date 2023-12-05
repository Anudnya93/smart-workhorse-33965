import React, { useContext, useState } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native'
import Icon from './Icon'
import { Fonts, Colors } from '../../res'
import PrimaryTextInput from './PrimaryTextInput'
import AppContext from '../../Utils/Context'

const CityInput = ({
  error,
  disabled,
  text,
  state,
  onSelection,
  viewStyle
}) => {
  const [visible, setVisible] = useState(false)
  const [cityText, setCityText] = useState('')
  const hideModal = () => {
    setVisible(false)
    setCityText('')
  }
  const { cities, loadingCity, _getCities } = useContext(AppContext)
  return (
    <>
      <View>
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={[styles.viewStyle, viewStyle, error && styles.errorBorder]}
          disabled={disabled}
        >
          <Text
            style={{
              ...Fonts.poppinsRegular(14),
              color: disabled
                ? Colors.BUTTON_BG1
                : state
                ? Colors.BLACK
                : Platform.OS == 'ios'
                ? '#bbb'
                : '#666'
            }}
          >
            {text}
          </Text>
          <Icon
            name="down"
            size={12}
            color={'gray'}
            style={{ marginLeft: 10 }}
            family="antdesign"
          />
        </TouchableOpacity>
      </View>
      {visible && (
        <Modal
          visible={visible}
          transparent
          onDismiss={hideModal}
          onRequestClose={hideModal}
        >
          <View style={styles.centerMode}>
            <View style={styles.modal}>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={hideModal}>
                  <Icon name="close" type="antdesign" />
                </TouchableOpacity>
              </View>
              <View style={{ width: '110%', marginLeft: '-5%' }}>
                <PrimaryTextInput
                  text={cityText}
                  key="cityText"
                  label="Enter city name"
                  onChangeText={text => {
                    _getCities(`?search=${text}`)
                    setCityText(text)
                  }}
                />
              </View>
              {loadingCity && (
                <ActivityIndicator
                  color={Colors.BACKGROUND_BG}
                  size={'small'}
                />
              )}
              <FlatList
                data={cities}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCityText('')
                        setVisible(false)
                        onSelection(item)
                      }}
                      key={index}
                      style={styles.item}
                    >
                      <Text
                        style={{
                          ...Fonts.poppinsRegular(14),
                          color: Colors.BLACK
                        }}
                      >
                        {item?.name}
                      </Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  )
}

export default CityInput

const styles = StyleSheet.create({
  viewStyle: {
    height: 50,
    width: '90%',
    paddingTop: 0,
    marginTop: 5,
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginLeft: '5%',
    backgroundColor: Colors.TEXT_INPUT_BG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: Colors.TEXT_INPUT_BORDER
  },
  item: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.TEXT_INPUT_BORDER
  },
  errorBorder: {
    borderColor: Colors.INVALID_TEXT_INPUT
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
