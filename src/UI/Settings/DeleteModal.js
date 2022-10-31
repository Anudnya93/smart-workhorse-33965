import React from 'react'
import {
  StyleSheet,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Text,
  Dimensions
} from 'react-native'
import { Colors, Images, Fonts } from '../../res'
import { Button, BaseComponent } from '../Common'
const { width, height } = Dimensions.get('window')

class DeleteModal extends BaseComponent {
  constructor (props) {
    super()
    this.state = {
      visible: true
    }
  }

  componentDidMount () {}

  renderSeparator () {
    return <View style={styles.separator} />
  }

  renderButton () {
    return (
      <View style={styles.footerButtonsContainer}>
        <Button
          style={styles.footerSkipButton}
          onPress={this.props.logout}
          loading={this.props.loading}
          title={'Yes'}
        />
      </View>
    )
  }

  renderCancelButton () {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={this.props.onCancel}
      >
        <Text style={styles.cancelText}>{this.ls('cancel')}</Text>
      </TouchableOpacity>
    )
  }

  render () {
    return (
      <Modal
        visible={this.props.visible}
        transparent
        onRequestClose={this.props.onRequestClose}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={this.props.onRequestClose}
        >
          <View style={styles.modalView}>
            <Text style={styles.title}>
              {'Are you sure you want to delete account?'}
            </Text>
            {this.renderButton()}
            {this.renderCancelButton()}
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
}

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
    position: 'absolute',
    justifyContent: 'center'
  },
  title: {
    ...Fonts.poppinsMedium(22),
    textAlign: 'center',
    color: Colors.BLACK
  },
  cancelText: {
    ...Fonts.poppinsRegular(14),
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
export default DeleteModal
