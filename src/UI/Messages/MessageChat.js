/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import database from '@react-native-firebase/database';
import Toast from 'react-native-simple-toast';
// import { COLORS, FONT1REGULAR, FONT2REGULAR } from '../../constants'
import userProfile from '../../res/Images/common/sample.png';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import moment from 'moment';
import { SvgXml } from 'react-native-svg';
import sendIcon from '../../res/Svgs/sendIcon.svg';
import smileIcon from '../../res/Svgs/smileIcon.svg';
import insertIcon from '../../res/Svgs/galleryIcon.svg';
import Colors from '../../res/Theme/Colors';
import { Fonts } from '../../res';
import AppContext from '../../Utils/Context';
import { useRef } from 'react';
import EmojiPicker from 'react-native-emoji-picker-staltz';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

function MessageChat({ navigation, route }) {
  const messageuid = route?.params?.messageuid;
  const orderData = route?.params?.orderData;
  const inputRef = useRef();
  // Context
  const context = useContext(AppContext);
  const { user } = context;
  // const user = ''
  let scrollView;
  const [state, setState] = useState({
    listHeight: 0,
    scrollViewHeight: 0,
    uploading: false,
    messages: [],
    messageText: '',
    messageData: null,
  });

  console.log({ messageuid });

  const { messageData, show } = state;

  const handleChange = (key, value) => {
    setState(pre => ({ ...pre, [key]: value }));
  };

  const onClickEmoji = emoji => {
    setState(prevState => ({
      ...prevState,
      messageText: prevState.messageText + emoji,
    }));
  };

  const downButtonHandler = () => {
    if (scrollView !== null) {
      scrollView.scrollToEnd !== null &&
        scrollView.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const db = database();
    if (user && messageuid) {
      db.ref('Messages/' + messageuid).on('value', snapshot => {
        if (snapshot.val()) {
          if (
            snapshot.val()?.senderId === user?.id ||
            snapshot.val()?.senderId === user?.employee_id
          ) {
            db.ref('Messages/' + messageuid)
              .update({ senderRead: 0 })
              .then(res => {
                db.ref('Messages/' + messageuid).once('value', snapshot => {
                  if (snapshot.val()) {
                    // getMessages()
                    console.log({
                      msgs: JSON.stringify(snapshot.val().messages),
                    });
                    setState(prevState => ({
                      ...prevState,
                      messages: snapshot.val().messages || [],
                      messageData: snapshot.val(),
                    }));
                  }
                });
              });
          }
          if (
            snapshot.val()?.receiverId === user?.id ||
            snapshot.val()?.receiverId === user?.employee_id
          ) {
            db.ref('Messages/' + messageuid)
              .update({ receiverRead: 0 })
              .then(res => {
                db.ref('Messages/' + messageuid).once('value', snapshot => {
                  if (snapshot.val()) {
                    // getMessages()
                    setState(prevState => ({
                      ...prevState,
                      messages: snapshot.val()?.messages || [],
                      messageData: snapshot.val(),
                    }));
                  }
                });
              });
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (scrollView !== null) {
      downButtonHandler();
    }
  });

  const _uploadImage = async type => {
    handleChange('uploading', true);
    let OpenImagePicker =
      type == 'camera'
        ? ImagePicker.openCamera
        : type == ''
        ? ImagePicker.openPicker
        : ImagePicker.openPicker;

    OpenImagePicker({
      cropping: true,
    })
      .then(async response => {
        if (!response.path) {
          handleChange('uploading', false);
        } else {
          const uri = response.path;
          const filename = Date.now();
          const uploadUri =
            Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
          const task = storage()
            .ref('Chat/' + filename)
            .putFile(uploadUri);
          // set progress state
          task.on('state_changed', snapshot => {});
          try {
            const durl = await task;
            task.snapshot.ref.getDownloadURL().then(downloadURL => {
              onSend(downloadURL, 'image');
            });
          } catch (e) {
            console.error(e);
          }
          handleChange('uploading', false);
        }
      })
      .catch(err => {
        handleChange('showAlert', false);
        handleChange('uploading', false);
      });
  };

  function onlySpaces(str) {
    return /^\s*$/.test(str);
  }

  const onSend = (text, type) => {
    if (onlySpaces(text || state.messageText)) {
      Toast.show('Please enter any character', Toast.LONG);
      return;
    }
    const data = {
      text: text || state.messageText,
      timeStamp: Date.now(),
      type: type || 'text',
      senderId: user?.id,
    };
    let messages = state.messages.concat(data);
    const values = {
      messages,
      senderRead:
        state?.messageData?.senderRead > 0
          ? Number(state.messageData.senderRead) + 1
          : 1,
      receiverRead:
        state?.messageData?.receiverRead > 0
          ? Number(state.messageData.receiverRead) + 1
          : 1,
    };

    database()
      .ref('Messages/' + messageuid)
      .update(values)
      .then(res => {
        setState(prevState => ({
          ...prevState,
          loading: false,
          messageText: '',
        }));
        downButtonHandler();
      })
      .catch(err => {
        console.log(err);
        Toast.show('Something went wrong!', Toast.LONG);
      });
  };

  const _handleSend = (message, id) => {
    var data = {
      app_id: '15b1f37a-b123-45e3-a8c4-f0ef7e091130',
      android_channel_id: '97ad04d8-51d2-4739-8e83-0479a7e8cd60',
      headings: { en: user?.username ? user?.username : 'Guest User' },
      contents: { en: message },
      include_player_ids: [id],
    };
    // sendNotification(data)
    //   .then(res => {
    //     if (res.status == 200) {
    //       console.log('done')
    //     } else {
    //       alert(JSON.stringify(res))
    //     }
    //   })
    //   .catch(error => {
    //     Alert.alert('Error!', error)
    //   })
  };

  const deleteMessage = async messageId => {
    try {
      await database()
        .ref(`Messages/${messageuid}/messages/${messageId}`)
        .remove();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleConfirmDelete = id => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [{ text: 'Cancel' }, { text: 'Yes', onPress: () => deleteMessage(id) }]
    );
  };

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        // backgroundColor: COLORS.backgroud
      }}
    >
      <View
        style={{
          height: 60,
          backgroundColor: Colors.BACKGROUND_BG,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: '95%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Icon
              name="arrowleft"
              type="antdesign"
              size={hp(2.8)}
              color={Colors.WHITE}
            />
          </TouchableOpacity>
          <Image
            style={{
              width: 40,
              borderRadius: 10,
              height: 40,
              marginRight: 10,
              marginLeft: 20,
            }}
            resizeMode="cover"
            source={
              messageData?.senderId === user?.id ||
              messageData?.senderId === user?.employee_id
                ? messageData?.receiver?.personal_information?.profile_image ||
                  messageData?.receiver?.profile_image
                  ? {
                      uri:
                        messageData?.receiver?.personal_information
                          ?.profile_image ||
                        messageData?.receiver?.profile_image,
                    }
                  : userProfile
                : messageData?.sender?.personal_information?.profile_image ||
                  messageData?.sender?.profile_image
                ? {
                    uri:
                      messageData?.sender?.personal_information
                        ?.profile_image || messageData?.sender?.profile_image,
                  }
                : userProfile
            }
          />
          <View>
            <Text style={{ color: Colors.WHITE, ...Fonts.poppinsRegular(12) }}>
              {messageData
                ? messageData?.senderId === user?.id ||
                  messageData?.senderId === user?.employee_id
                  ? (messageData?.receiver?.personal_information?.first_name ||
                      messageData?.receiver?.first_name) +
                    ' ' +
                    (messageData?.receiver?.personal_information?.last_name ||
                      messageData?.receiver?.last_name)
                  : messageData?.sender?.name ||
                    messageData?.sender?.first_name +
                      ' ' +
                      messageData?.sender?.last_name
                : ''}
            </Text>
            {/* <Text style={{ color: Colors.WHITE, ...Fonts.poppinsRegular(9) }}>
              Last seen 9:15 PM
            </Text> */}
          </View>
        </View>
      </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{
            justifyContent: 'flex-end',
            borderTopWidth: 1,
            // borderTopColor: COLORS.borderColor1,
            alignItems: 'center',
            flex: 1,
          }}
          style={{
            width: '100%',
            // backgroundColor: COLORS.white,
            height: '100%',
          }}
        >
          <FlatList
            data={state?.messages}
            keyboardDismissMode="on-drag"
            onContentSizeChange={(contentWidth, contentHeight) => {
              setState(prevState => ({
                ...prevState,
                listHeight: contentHeight,
              }));
            }}
            onLayout={e => {
              const height = e.nativeEvent.layout.height;
              setState(prevState => ({
                ...prevState,
                scrollViewHeight: height,
              }));
            }}
            style={{ width: '90%', flex: 1 }}
            contentContainerStyle={{
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
            }}
            ref={ref => {
              scrollView = ref;
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index?.toString()}
            renderItem={({ item, index }) => {
              if (item == null) {
                return <View />;
              } else if (item?.senderId !== user?.id) {
                return (
                  <View
                    key={index}
                    style={{
                      width: '100%',
                      marginVertical: 10,
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                        paddingBottom: 10,
                      }}
                    >
                      <Image
                        style={{
                          width: 40,
                          borderRadius: 10,
                          height: 40,
                          marginRight: 10,
                        }}
                        resizeMode="cover"
                        source={
                          messageData?.senderId === user?.id
                            ? messageData?.receiver?.personal_information
                                ?.profile_image
                              ? {
                                  uri: messageData?.receiver
                                    ?.personal_information?.profile_image,
                                }
                              : userProfile
                            : messageData?.sender?.personal_information
                                ?.profile_image
                            ? {
                                uri: messageData?.sender?.personal_information
                                  ?.profile_image,
                              }
                            : userProfile
                        }
                      />
                      <View
                        style={{
                          backgroundColor: Colors.MESSAGEB_BOX_LIGHT,
                          maxWidth: '80%',
                          borderRadius: 10,
                          padding: 15,
                        }}
                      >
                        {item?.type === 'image' ? (
                          <Image
                            source={{ uri: item?.text }}
                            style={{
                              width: 200,
                              height: 200,
                              resizeMode: 'contain',
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: Colors.BLACK,
                              ...Fonts.poppinsRegular(12),
                              lineHeight: 20,
                            }}
                          >
                            {item?.text}
                          </Text>
                        )}
                        <View
                          style={{
                            width: '100%',
                            alignItems: 'flex-end',
                            marginTop: 10,
                          }}
                        >
                          <Text
                            style={{
                              ...Fonts.poppinsRegular(8),
                              // color: COLORS.darkBlack,
                              // fontFamily: FONT1REGULAR,
                              marginTop: -5,
                            }}
                          >
                            {moment(item?.timeStamp).fromNow()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              } else {
                return (
                  <TouchableOpacity
                    onLongPress={() => handleConfirmDelete(index)}
                    key={index}
                    style={{
                      width: '100%',
                      marginVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      style={{
                        width: '95%',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        paddingBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: Colors.BACKGROUND_BG,
                          maxWidth: '85%',
                          alignItems: 'flex-end',
                          borderRadius: 10,
                          borderBottomRightRadius: 0,
                          padding: 10,
                        }}
                      >
                        {item?.type === 'image' ? (
                          <Image
                            source={{ uri: item?.text }}
                            style={{
                              width: 200,
                              height: 200,
                              resizeMode: 'contain',
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: Colors.WHITE,
                              // fontFamily: FONT1REGULAR,
                              lineHeight: 20,
                              ...Fonts.poppinsRegular(12),
                            }}
                          >
                            {item?.text}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: Colors.WHITE,
                            // fontFamily: FONT1REGULAR,
                            ...Fonts.poppinsRegular(8),
                            marginTop: -5,
                          }}
                        >
                          {moment(item?.timeStamp).fromNow()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
          />
          {state?.uploading && (
            <View
              style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}
            >
              <ActivityIndicator size={'small'} color={Colors.BACKGROUND_BG} />
            </View>
          )}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 70,
              backgroundColor: Colors.BACKGROUND_BG,
            }}
          >
            <TouchableOpacity
              style={{
                marginRight: 8,
              }}
              onPress={_uploadImage}
            >
              <SvgXml xml={insertIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                inputRef.current?.blur();
                handleChange('show', !show);
              }}
            >
              <SvgXml xml={smileIcon} />
            </TouchableOpacity>
            <Input
              ref={inputRef}
              placeholderTextColor="#58595B"
              inputStyle={{
                ...Fonts.poppinsRegular(12),
                // color: COLORS.darkGrey,
                // fontFamily: FONT1REGULAR,
                marginLeft: 10,
              }}
              inputContainerStyle={{
                borderBottomWidth: 0,
                borderRadius: 50,
              }}
              onFocus={() => handleChange('show', false)}
              containerStyle={{
                paddingLeft: 0,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors.WHITE,
                width: '65%',
                marginHorizontal: 10,
              }}
              onChangeText={message =>
                setState(prevState => ({ ...prevState, messageText: message }))
              }
              value={state.messageText}
              onSubmitEditing={() =>
                state.messageText ? onSend() : console.log('')
              }
              blurOnSubmit={false}
              returnKeyType="send"
              placeholder={'Write a message'}
            />

            <TouchableOpacity
              style={{}}
              onPress={() => {
                state.messageText ? onSend() : console.log('');
              }}
            >
              <SvgXml xml={sendIcon} />
            </TouchableOpacity>
          </View>
          {show && (
            <EmojiPicker
              onEmojiSelected={onClickEmoji}
              rows={6}
              hideClearButton
              modalStyle={{ height: '50%' }}
              backgroundStyle={{ backgroundColor: '#fff', height: '50%' }}
              onPressOutside={() => handleChange('show', false)}
              containerStyle={{ height: '100%' }}
              localizedCategories={[
                // Always in this order:
                'Smileys and emotion',
                'People and body',
                'Animals and nature',
                'Food and drink',
                'Activities',
                'Travel and places',
                'Objects',
                'Symbols',
              ]}
            />
          )}
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
  },
  title: {
    // color: COLORS.darkBlack,
    fontSize: hp(3),
    // fontFamily: FONT2REGULAR
  },
  online: {
    // color: COLORS.darkGrey,
    fontSize: hp(2),
    // fontFamily: FONT1REGULAR
  },
  backText: {
    // color: COLORS.primary,
    fontSize: hp(2),
    // fontFamily: FONT1REGULAR
  },
});

export default MessageChat;
