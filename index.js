import React from 'react';
import { registerRootComponent } from 'expo';
import { Platform, AppRegistry, LogBox } from 'react-native'
import App from './App';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';

console.log("index.js 画面を起動します。");

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('アンドロイド：プッシュ通知(Message handled in the background!)', remoteMessage);

  try {
    // handbookからのメッセージ  jp.go.otit.handbook
    if (typeof remoteMessage.collapseKey !== "undefined" && remoteMessage.collapseKey !== null) {
      const sCollapseKey = remoteMessage.collapseKey;
      BackEndBadgeCount(remoteMessage);
    }

    // SafetyTipsからのメッセージ rcsc_bosai_push_eew
    if (typeof remoteMessage.collapse_key !== "undefined" && remoteMessage.collapse_key !== null) {
      const sNoticeSwitch = await AsyncStorage.getItem('noticeSwitch');
      const sCollapse_Key = remoteMessage.collapse_key; // "rcsc_bosai_push_eew"固定
      if (sCollapse_Key == "rcsc_bosai_push_eew") {
        // 災害通知設定Onの場合、受信できる
        if (sNoticeSwitch !== null && sNoticeSwitch == "true") {
          BackEndBadgeCountForSafetyTips();
        }
      }
    }
  }
  catch (e) {
    console.error("プッシュ通知(バックエンド)  error ： ", e);
  }

});

// FCM　バックグラウンドで自動的に実行する
// アンドロイドの場合
if (Platform.OS === 'android') {
  /*
  // 特定な黄色警告メッセージを非表示する
  LogBox.ignoreWarnings(['Warning: BackAndroid is deprecated. Please use BackHandler instead.'
                                      , 'source.uri should not be an empty string'
                                      , 'Invalid props.style key'
                        ]);
  */

  // すべての黄色警告メッセージを非表示する
  LogBox.ignoreAllLogs(true);

  registerRootComponent(App);
}
else { // IOSの場合

  /*
  // 特定な黄色警告メッセージを非表示する
  LogBox.ignoreWarnings(['Warning: BackAndroid is deprecated. Please use BackHandler instead.'
                                      , 'source.uri should not be an empty string'
                                      , 'Invalid props.style key'
                        ]);
  */

  // すべての黄色警告メッセージを非表示する
  LogBox.ignoreAllLogs(true);

  //registerRootComponent(App);

  function HeadlessCheck({ isHeadless }) {
    if (isHeadless) {
      // App has been launched in the background by iOS, ignore
      return null;
    }

    return <App />;
  }

  AppRegistry.registerComponent('main', () => HeadlessCheck);

}

//　Firebaseのバックエンドでバッジの数を合算する
async function BackEndBadgeCount(remoteMessage) {
  try {
/*  20210205 mod by oushibu
    // メッセージ内容解析
    console.log("messageData data        : ", remoteMessage.data);
    console.log("messageData Action      : ", remoteMessage.data.Action);
    console.log("messageData MessageType : ", remoteMessage.data.MessageType);

    const sMessageType = remoteMessage.data.MessageType;
    const sAction = remoteMessage.data.Action;
*/
    console.log("index.js -> remoteMessage.from  : ", remoteMessage.from);
    const sMessageType = remoteMessage.from;
    const sAction = "Add";

    let whoMessage = "";

    // お知らせのメッセージが届く場合  /topics/notice-jp
    if (sMessageType.indexOf("notice") > 0) {  // 20210205 mod by oushibu
      const sNoticeBackCounts = await AsyncStorage.getItem('FirebaseNoticeBackCount');

      if (sAction == "Add") {
        if (sNoticeBackCounts !== null) {
          let iNoticeBackCounts = parseInt(sNoticeBackCounts);
          iNoticeBackCounts++;
          await AsyncStorage.setItem('FirebaseNoticeBackCount', iNoticeBackCounts.toString());
          console.log("FirebaseNoticeBackCount :", iNoticeBackCounts);
        } else {
          await AsyncStorage.setItem('FirebaseNoticeBackCount', "1");
          console.log("FirebaseNoticeBackCount(新規) :", await AsyncStorage.getItem('FirebaseNoticeBackCount'));
        }

        whoMessage = i18n.t('HBA-0000-newNotice');    // 新着お知らせがあります
        await AsyncStorage.setItem('FirebaseBackendWhoMessage', whoMessage);
        console.log("バックエンドのメッセージが :", whoMessage);
      }
      /*
      else if (sAction == "Delete") {
        if (sNoticeBackCounts !== null) {
          let iNoticeBackCounts = parseInt(sNoticeBackCounts);
          iNoticeBackCounts--;
          await AsyncStorage.setItem('FirebaseNoticeBackCount', iNoticeBackCounts.toString());
          console.log("FirebaseNoticeBackCount :", iNoticeBackCounts);
        } else {
          await AsyncStorage.setItem('FirebaseNoticeBackCount', "-1");
          console.log("FirebaseNoticeBackCount(新規) :", await AsyncStorage.getItem('FirebaseNoticeBackCount'));
        }
      }
      else {
      }
      */
    }
    // アンケートのメッセージが届く場合  /topics/questionnaire-jp
    else if (sMessageType.indexOf("questionnaire") > 0) {  // 20210205 mod by oushibu
      const sQuestionnaireBackCounts = await AsyncStorage.getItem('FirebaseQuestionnaireBackCount');

      if (sAction == "Add") {
        if (sQuestionnaireBackCounts !== null) {
          let iQuestionnaireBackCounts = parseInt(sQuestionnaireBackCounts);
          iQuestionnaireBackCounts++;

          await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', iQuestionnaireBackCounts.toString());
          console.log("FirebaseQuestionnaireBackCount :", iQuestionnaireBackCounts);
        } else {
          await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', "1");
          console.log("FirebaseQuestionnaireBackCount(新規) :", await AsyncStorage.getItem('FirebaseQuestionnaireBackCount'));
        }

        whoMessage = i18n.t('HBA-0000-newQuestionary'); // 新着アンケートがあります
        await AsyncStorage.setItem('FirebaseBackendWhoMessage', whoMessage);
        console.log("バックエンドのメッセージが :", whoMessage);
      }
      /*
      else if (sAction == "Delete") {
        if (sQuestionnaireBackCounts !== null) {
          let iQuestionnaireBackCounts = parseInt(sQuestionnaireBackCounts);
          iQuestionnaireBackCounts = iQuestionnaireBackCounts--;

          await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', iQuestionnaireBackCounts.toString());
          console.log("FirebaseQuestionnaireBackCount :", iQuestionnaireBackCounts);
        } else {
          await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', "-1");
          console.log("FirebaseQuestionnaireBackCount(新規) :", await AsyncStorage.getItem('FirebaseQuestionnaireBackCount'));
        }
      }
      else {
      }
      */
    }
  }
  catch (e) {
    console.error("BackEndBadgeCount error ： ", e)
  }
}

//　Firebaseのバックエンドでバッジの数を合算する(SafteyTips)
async function BackEndBadgeCountForSafetyTips() {
  try {
    const sDisasterBackCounts = await AsyncStorage.getItem('FirebaseDisasterBackCount');

    if (sDisasterBackCounts !== null) {
      let iDisasterBackCounts = parseInt(sDisasterBackCounts);
      iDisasterBackCounts++;
      await AsyncStorage.setItem('FirebaseDisasterBackCount', iDisasterBackCounts.toString());
      console.log("FirebaseDisasterBackCount :", iDisasterBackCounts);
    } else {
      await AsyncStorage.setItem('FirebaseDisasterBackCount', "1");
      console.log("FirebaseDisasterBackCount(新規) :", await AsyncStorage.getItem('FirebaseDisasterBackCount'));
    }
  }
  catch (e) {
    console.error("BackEndBadgeCountForSafetyTips error ： ", e)
  }
}


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately

