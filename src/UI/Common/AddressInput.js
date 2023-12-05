import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Modal,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native'
import axios from 'axios'
import Strings from '../../res/Strings'
import { Fonts, Colors } from '../../res'
import Icon from './Icon'
import { API_KEY } from '../../../env'

let debounceTimeout

const AddressInput = ({ callback, style, address, handlesave }) => {
  const searchRef = useRef('')
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(address || '')
  const [loading, setLoading] = useState(false)

  const handleSearch = v => {
    setSearchText(v)
    searchRef.current = v
    if (v != '') {
      debouncedSearch()
    } else {
      searchRef.current = ''
    }
  }
  const handleClose = () => {
    setSearchResults([])
    setSearchText('')
    setModalVisible(false)
  }

  const handleSelectAddress = selectedAddress => {
    console.log('Selected Address:', selectedAddress)
    setSelectedAddress(selectedAddress.formatted_address)
    const lineOne = selectedAddress.formatted_address

    const lat = selectedAddress.geometry.location.lat
    const long = selectedAddress.geometry.location.lng
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${selectedAddress.place_id}&fields=geometry,address_components&key=${API_KEY}`
      )
      .then(res => {
        console.log(JSON.stringify(res.data.result))
        const addressComponents = res.data.result.address_components
        console.log({ addressComponents })
        let city = ''
        let state = ''
        let zipcode = ''
        let country = ''
        addressComponents.forEach(component => {
          if (component.types.includes('locality')) {
            city = component.long_name
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name
          } else if (component.types.includes('postal_code')) {
            zipcode = component.long_name
          } else if (component.types.includes('country')) {
            country = component.long_name
          }
        })
        callback({
          city,
          state,
          zipcode,
          lineOne,
          lat,
          long,
          country
        })
        handleClose()
      })
  }

  const debouncedSearch = () => {
    if (debounceTimeout !== undefined) {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(doSearch, 500)
    } else {
      debounceTimeout = setTimeout(doSearch, 500)
    }
  }

  const doSearch = () => {
    if (searchRef.current == '') {
      return
    }
    setLoading(true)
    const searchedString = searchRef.current
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchText}&key=${API_KEY}`
      )
      .then(res => {
        if (searchRef.current === searchedString) {
          console.log({ resp: res.data.results })
          setSearchResults(res.data.results)
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    setSelectedAddress(address)
  }, [address])

  return (
    <View>
      <TouchableOpacity
        style={[styles.inputStyle, { paddingTop: 15 }, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.text,
            !selectedAddress && {
              color: Platform.OS == 'ios' ? '#bbb' : '#666'
            }
          ]}
          numberOfLines={1}
        >
          {selectedAddress ? selectedAddress : Strings.addressLine1 + '*'}
        </Text>
      </TouchableOpacity>
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <>
            <View style={{ marginTop: Platform.OS == 'ios' ? 50 : 25 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false)
                  searchRef.current = ''
                  handleClose()
                }}
                style={styles.close}
              >
                <Icon name="close" family="antdesign" size={25} />
              </TouchableOpacity>
              <View>
                <TextInput
                  style={styles.inputStyle}
                  allowFontScaling={false}
                  placeholder="Search for an address"
                  onChangeText={text => handleSearch(text)}
                  value={searchText}
                  autoFocus
                  enterKeyHint={'done'}
                  returnKeyType={'done'}
                />
                {loading && (
                  <ActivityIndicator
                    size={30}
                    color={Colors.BUTTON_BG}
                    style={{ marginVertical: 5 }}
                  />
                )}
                <FlatList
                  data={searchResults}
                  keyExtractor={item => item.placeId}
                  contentContainerStyle={styles.flatlist}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.selection}
                      onPress={() => handleSelectAddress(item)}
                    >
                      <Text
                        style={[styles.text, styles.formatted_address]}
                      >{`${item.formatted_address}`}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                handlesave(searchText)
                searchRef.current = ''
                handleClose()
              }}
              style={styles.save}
            >
              <Text
                style={[
                  style.text,
                  {
                    color: 'white'
                  }
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </>
        </Modal>
      )}
    </View>
  )
}

export default AddressInput

const styles = StyleSheet.create({
  inputStyle: {
    height: 50,
    width: '90%',
    paddingTop: Platform.OS === 'android' ? 15 : 0,
    borderRadius: 10,
    color: Colors.TEXT_INPUT_COLOR,
    paddingHorizontal: 15,
    ...Fonts.poppinsRegular(14),
    borderWidth: 1,
    backgroundColor: Colors.TEXT_INPUT_BG,
    borderColor: Colors.TEXT_INPUT_BORDER,
    alignSelf: 'center',
    marginBottom: 10
  },
  text: {
    ...Fonts.poppinsRegular(14),
    color: Colors.TEXT_INPUT_COLOR
  },
  save: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: '33%',
    backgroundColor: Colors.BUTTON_BG,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10
  },
  flatlist: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 300
  },
  close: {
    alignSelf: 'flex-end',
    marginRight: 15,
    marginBottom: 10
  },
  formatted_address: {
    textAlign: 'center',
    lineHeight: 25,
    paddingVertical: 3
  },
  selection: {
    marginBottom: 3,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1
  }
})
