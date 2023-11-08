import React from 'react'
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Text,
  Dimensions
} from 'react-native'
import { Button } from '../Common'
import { Colors, Images, Fonts } from '../../res'
import { heightPercentageToDP } from 'react-native-responsive-screen'

const { width, height } = Dimensions.get('window')

const ConfirmPopUp = ({
  visible,
  setVisible,
  title,
  desc,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  cancelHandler = () => {},
  confirmHandler = () => {}
}) => {
  const handleCancel = () => {
    setVisible(false)
    cancelHandler()
  }
  const renderButton = () => {
    return (
      <View style={styles.footerButtonsContainer}>
        <Button
          style={styles.footerSkipButton}
          onPress={confirmHandler}
          title={confirmText}
        />
      </View>
    )
  }

  const renderCancelButton = () => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={handleCancel}
      >
        <Text style={styles.cancelText}>{cancelText}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <Modal visible={visible} transparent>
      <TouchableOpacity style={styles.container}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
          {renderButton()}
          {renderCancelButton()}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default ConfirmPopUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  },
  modalView: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    paddingVertical: 40,
    position: 'absolute',
    justifyContent: 'center'
  },
  title: {
    ...Fonts.poppinsMedium(22),
    textAlign: 'center',
    color: Colors.BLACK
  },
  desc: {
    ...Fonts.poppinsRegular(14),
    textAlign: 'center',
    color: Colors.BLACK,
    marginTop: 20
  },
  cancelText: {
    ...Fonts.poppinsMedium(14),
    color: Colors.BUTTON_BG
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    width: '100%'
  },
  footerSkipButton: {
    width: '100%'
  }
})
