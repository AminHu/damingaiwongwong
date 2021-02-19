/*
 * モジュール名 : トップ画面
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */

// [*] ライブラリのインポート
import React, { Component, useEffect } from "react";
//import Expo from 'expo';
import {
  View,
  // Text,
  Button,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  requireNativeComponent,
  Linking,
  AppState,
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import IconBadge from "react-native-icon-badge";
import { Grid, Row, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import * as Font from 'expo-font';

import i18n from 'i18n-js';
import defaultLan from '../../handbook_config.json';
import { Alert, } from "react-native";
import messaging from '@react-native-firebase/messaging';
import iid from '@react-native-firebase/iid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetTalkURL } from './../common/utils'

/*
// Firebaseのトークンを取得
async function getToken() {
  const token = await iid().getToken();
  console.log('Current Token : ', token);
}
getToken();

*/

function getAllMenuDatas() {
  let datas = [
    // [btn] お知らせ
    {
      menu: "NoticeScreen",
      name: i18n.t('HBA-0000-btnNotice'),
      header: true,
      icon: require("../../assets/image/0000/Notice.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] 災害情報
    {
      menu: "DisasterListScreen",
      name: i18n.t('HBA-0000-btnDisaster'),
      header: true,
      icon: require("../../assets/image/0000/DisasterListScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] 事務所検索
    {
      menu: "OfficeScreen",
      name: i18n.t('HBA-0000-btnOfficeSearch'),
      header: true,
      icon: require("../../assets/image/0000/OfficeScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] 母国語相談
    {
      menu: "HomelandScreen",
      name: i18n.t('HBA-0000-btnConsultation'),
      header: true,
      icon: require("../../assets/image/0000/HomelandScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] アンケート
    {
      menu: "QuestionnaireScreen",
      name: i18n.t('HBA-0000-btnQuestionary'),
      header: true,
      icon: require("../../assets/image/0000/QuestionnaireScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] アプリ共有
    {
      menu: "ShareScreen",
      name: i18n.t('HBA-0000-btnAppShare'),
      header: true,
      icon: require("../../assets/image/0000/ShareScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] ヘルプ
    {
      menu: "HelpScreen",
      name: i18n.t('HBA-0000-btnHelps'),
      header: true,
      icon: require("../../assets/image/0000/HelpScreen.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] 言語設定
    {
      menu: "LanguagesScreen",
      name: i18n.t('HBA-0000-btnLangSetting'),
      header: true,
      icon: require("../../assets/image/0000/Languages.png"),
      badge: 0,
      isShow : true,
    },
    // [btn] 通知設定
    {
      menu: "NoticeSetScreen",
      name: i18n.t('HBA-0000-btnNoticeSetting'),
      header: true,
      icon: require("../../assets/image/0000/NoticeSetScreen.png"),
      badge: 0,
      isShow : true,
    },
  ];

  return datas;
}

// お知らせとアンケートバッジの数値を更新
// type : 0 -> お知らせ   4 ->　アンケート
function updateBadge(datas, index, action) {
  let boolUpdate = false;  // 変更があるかどうか
  console.log("updateBadge(datas, index) : ", index, datas[index].menu, datas[index].badge);

  let iTotal = datas[index].badge;

  // 追加の場合、
  if (action == "Add") {
    // バッジの件数が１００を超えた場合、"99+"を表示する 
    if (iTotal != "99+") {
      if (iTotal == 99) {
        datas[index].badge = "99+";
      }
      else {
        datas[index].badge = datas[index].badge + 1;
      }
      boolUpdate = true; // 更新あり
    }
  }
  /*
  // 削除の場合、
  else if (action == "Delete") {
    if (iTotal == "99+") {
      datas[index].badge = 99;
      boolUpdate = true;  // 更新あり
    }
    else {
      if (iTotal > 0) {
        datas[index].badge = datas[index].badge - 1;
        boolUpdate = true;  // 更新あり
      }
    }
  }*/
  else {
    boolUpdate = false;  // 更新なし
  }

  return boolUpdate;
}

// [*]トップメニュー設定
export default class HomeScreen extends Component {
  // [*] 画面情報を配列に格納
  constructor(props) {
    super(props);
    this.state = {
      screenId: 'HBA-0000',
      isReady: false,
      talkURL: '',   // 母国語相談URL
      data: getAllMenuDatas(),
      newMessage: "",
      appState: AppState.currentState,
    };
  }

  // [*] イベント処理
  onPress = async (menu) => {
    //console.log("選択メニュー：" + menu);
    // 画面遷移
    // 母国語相談の場合
    if (menu == "HomelandScreen") {
      Linking.openURL(this.state.talkURL);
    }
    else {
      // 通知設定
      if (menu == "NoticeSetScreen") {
        // 遷移元を保存する
        await AsyncStorage.setItem('MoveMoto','top');
      }

      this.props.navigation.navigate(menu);
    }
  }

  async componentDidMount() {
    console.log("Top画面：componentDidMount");

    AppState.addEventListener("change", this._handleAppStateChange);

    try {
      this.loadFonts();

      // 初回起動の判定
      //await AsyncStorage.clear(); // 端末に保存しているものをすべてクリアする　テスト用
      const value = await AsyncStorage.getItem('lang');

      // 初期起動の場合、言語がnullになっています。
      if (value == null) {
        console.log("トップ画面 : componentDidMount -> 現在は初回起動");

        // 初回起動のフラグを設定する。
        await AsyncStorage.setItem('FirstStart', "true");
        this.props.navigation.navigate('FirstStartLanguageSettingScreen');
      }
      else {
        // 初回起動ではない場合
        await AsyncStorage.setItem('FirstStart', "false");

        i18n.locale = value;
        const newData = getAllMenuDatas(i18n);
        const talkURL = await GetTalkURL();

        // 日本語及びモンゴル語の場合は「母国語相談ボタン」は非表示になること
        if (value == "ja" || value == "mn") {
          newData[3].isShow = false;  // 母国語相談ボタンを隠す
        }
        else {
          newData[3].isShow = true;  // 母国語相談ボタンを表示する
        }

        this.setState({ data: newData, talkURL: talkURL });
        //画面タイトルを変更する
        const { setOptions } = this.props.navigation;
        setOptions({ title: i18n.t('HBA-0000-title') })
      }

      // リスナー（フォーカスイベント）を追加する。
      this._unsubscribe1 = this.props.navigation.addListener('focus', async () => {
        // 初回起動フラグを更新する
        await AsyncStorage.setItem('FirstStart', "false");

        const langValue = await AsyncStorage.getItem('lang');
        i18n.locale = langValue;
        let datas = this.state.data;

        // 画面タイトルを変更する
        const { setOptions } = this.props.navigation;
        setOptions({ title: i18n.t('HBA-0000-title') })
        
        // 日本語及びモンゴル語の場合は「母国語相談ボタン」は非表示になること
        if (langValue == "ja" || langValue == "mn") {
          datas[3].isShow = false;  // 母国語相談ボタンを隠す
        }
        else {
          datas[3].isShow = true;  // 母国語相談ボタンを表示する
        }

        // タイトルを変更する
        datas[0].name = i18n.t('HBA-0000-btnNotice');         // お知らせ
        datas[1].name = i18n.t('HBA-0000-btnDisaster');       // 災害情報
        datas[2].name = i18n.t('HBA-0000-btnOfficeSearch');   // 事務所検索
        datas[3].name = i18n.t('HBA-0000-btnConsultation');   // 母国語相談
        datas[4].name = i18n.t('HBA-0000-btnQuestionary');    // アンケート
        datas[5].name = i18n.t('HBA-0000-btnAppShare');       // アプリ共有
        datas[6].name = i18n.t('HBA-0000-btnHelps');          // ヘルプ
        datas[7].name = i18n.t('HBA-0000-btnLangSetting');    // 言語設定
        datas[8].name = i18n.t('HBA-0000-btnNoticeSetting');  // 通知設定

        const talkURL = await GetTalkURL();

        // 各バッジの内容をクリアする
        const fromNotice = await AsyncStorage.getItem('BlurFromNotice');
        const fromDisaster = await AsyncStorage.getItem('BlurFromDisaster');
        const fromQuestionnaire = await AsyncStorage.getItem('BlurFromQuestionnaire');

        // 言語切り替え
        const languageIsChanged = await AsyncStorage.getItem('LanguageIsChanged');        

        // お知らせの場合
        if (fromNotice !== null && fromNotice == "Yes") {
          await AsyncStorage.setItem('BlurFromNotice','No');
          datas[0].badge = 0;
          await AsyncStorage.setItem('FirebaseNoticeBackCount', "0");
        }

        // 災害情報の場合
        if (fromDisaster !== null && fromDisaster == "Yes") {
          await AsyncStorage.setItem('BlurFromDisaster','No');
          datas[1].badge = 0;
          await AsyncStorage.setItem('FirebaseDisasterBackCount', "0");
        }

        // アンケートの場合
        if (fromQuestionnaire !== null && fromQuestionnaire == "Yes") {
          await AsyncStorage.setItem('BlurFromQuestionnaire','No');
          datas[4].badge = 0;
          await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', "0");
        }

        // 言語設定を変更した場合、通知済みの新規件数をリセットする(お知らせとアンケート)
        if (languageIsChanged != null && languageIsChanged == "Yes") {
          await AsyncStorage.setItem('LanguageIsChanged','No');  
          datas[0].badge = 0; // お知らせ委
          datas[4].badge = 0; // アンケート
        }
        
        // メッセージの内容を更新する
        this._updateMessage();
        
        this.setState({ data: datas, talkURL: talkURL });
      });

      // foreground : バッジを更新するため、Firebaseのプッシュ通知のリスナーを追加する
      this._unsubscribe2 = messaging().onMessage(async remoteMessage => {
        //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

        /* 
            {
                "notification":{
                    "android":{

                    },
                    "body":"sdfsf",
                    "title":"dsfsfdsf"
                },
                "sentTime":1612499569322,
                "data":{

                },
                "from":"/topics/notice-jp",
                "messageId":"0:1612499569656024%435d4f58435d4f58",
                "ttl":2419200,
                "collapseKey":"jp.go.otit.handbook"
            }
        */

        try {
          // handbookからのメッセージ  jp.go.otit.handbook
          if (typeof remoteMessage.collapseKey !== "undefined" && remoteMessage.collapseKey !== null) {
/*  20210205 mod by oushibu
            // メッセージ内容解析
            console.log("messageData data        : ", remoteMessage.data);
            console.log("messageData Action      : ", remoteMessage.data.Action);
            console.log("messageData MessageType : ", remoteMessage.data.MessageType);

            const sMessageType = remoteMessage.data.MessageType;
            const sAction = remoteMessage.data.Action;
            // お知らせのメッセージが届く場合
            if (sMessageType == "Notice") {
              const rtnIfUpdate = updateBadge(this.state.data, 0, sAction); // お知らせバッジ更新
              // 画面更新を行う
              if (rtnIfUpdate) {
                if (sAction == "Add") {
                  this.setState({ data: this.state.data });
                }
              }
            }
            // アンケートのメッセージが届く場合
            else if (sMessageType == "Questionnaire") {
              const rtnIfUpdate = updateBadge(this.state.data, 4, sAction); // アンケートバッジ更新
              if (sAction == "Add") {
                this.setState({ data: this.state.data });
              }
            }
          }
*/
            // 20210205 mod by oushibu
            // メッセージ内容解析
            console.log("top.js -> remoteMessage.from : ", remoteMessage.from);
            const sMessageType = remoteMessage.from;
            const sAction = "Add";

            // お知らせのメッセージが届く場合  /topics/notice-jp
            if (sMessageType.indexOf("notice") > 0) {
              const rtnIfUpdate = updateBadge(this.state.data, 0, sAction); // お知らせバッジ更新
              // 画面更新を行う
              if (rtnIfUpdate) {
                if (sAction == "Add") {
                  this.setState({ data: this.state.data });
                }
              }
            }
            // アンケートのメッセージが届く場合  /topics/questionnaire-jp
            else if (sMessageType.indexOf("questionnaire") > 0) {
              const rtnIfUpdate = updateBadge(this.state.data, 4, sAction); // アンケートバッジ更新
              if (sAction == "Add") {
                this.setState({ data: this.state.data });
              }
            }
          }

          // 災害情報バッジ更新 : SafetyTipsからのメッセージ rcsc_bosai_push_eew
          if (typeof remoteMessage.collapse_key !== "undefined" && remoteMessage.collapse_key !== null) {
            const sNoticeSwitch = await AsyncStorage.getItem('noticeSwitch');
            const sCollapse_Key = remoteMessage.collapse_key; // "rcsc_bosai_push_eew"固定

            if (sCollapse_Key == "rcsc_bosai_push_eew") {
              // 災害通知設定Onの場合、受信できる
              if (sNoticeSwitch !== null && sNoticeSwitch == "true") {
                const rtnIfUpdate = updateBadge(this.state.data, 1, "Add"); // 災害情報バッジ更新
                // 画面更新を行う
                if (rtnIfUpdate) {
                  this.setState({ data: this.state.data, newMessage: i18n.t('HBA-0000-newDisaster') });    // 新着災害情報があります
                }
              }
            }
          }

          // メッセージの内容を更新する
          this._updateMessage();
        }
        catch (e) {
          console.log("foregroundバッジ更新-> メッセージ解析エラー ： ", e)
        }

      }); // this._unsubscribe2 end

      // Appはバックエンドからフロントに切り替えする時
      try {
        this._updateBadgeForBackend();
      }
      catch (e) {
        console.log("トップ画面->Foregournd-Backend :エラーが発生しました。", e);
      }
    }
    catch (e) {
      console.log("TOP画面->componentDidMount: エラーが発生しました。", e);
    }
  }

  _handleAppStateChange = nextAppState => {
    console.log("現在Appの状態 : ", nextAppState);

    if (nextAppState === "active") {
      console.log("App has come to the foreground!");
      try {
        this._updateBadgeForBackend();
      }
      catch (e) {
        console.log("更新バッジは失敗しました。", e);
      }
    }
    else if (nextAppState === "background") {
      console.log("Backgroundへ");
      this._saveBadgeInfo();
    }
    // Apple IOSの場合
    else if (nextAppState === 'inactive') {
      console.log("Apple IOSの場合 : Inactive mode");
      try {
        this._updateBadgeForBackend();
      }
      catch (e) {
        console.log("更新バッジは失敗しました。", e);
      }
    }

    try {
      this.setState({ appState: nextAppState });
    }
    catch (e) {

    }
  };

  // Backgoundに切り替え前に画面のバッジ情報を保存する。
  async _saveBadgeInfo() {
    // 画面のバッジ情報を保存する。
    await AsyncStorage.setItem('FirebaseNoticeBackCount', this.state.data[0].badge.toString());
    await AsyncStorage.setItem('FirebaseDisasterBackCount', this.state.data[1].badge.toString());
    await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', this.state.data[4].badge.toString());
    //await AsyncStorage.setItem('FirebaseBackendWhoMessage', this.state.newMessage.toString());

    // 画面のバッジ情報をクリアする
    this.state.data[0].badge = 0;  // お知らせバッジ
    this.state.data[1].badge = 0;  // 災害情報バッジ
    this.state.data[4].badge = 0;  // アンケートバッジ
    //this.state.newMessage = "";

    //console.log("Back-endへ：お知らせのバッジ数: ",await (await AsyncStorage.getItem('FirebaseNoticeBackCount')).toString());
    //console.log("Back-endへ：アンケートのバッジ数: ",await (await AsyncStorage.getItem('FirebaseQuestionnaireBackCount')).toString());
    //console.log("Back-endへ：現在のメッセージ: ",await (await AsyncStorage.getItem('FirebaseBackendWhoMessage')).toString());
  }

  // バックエンドからForegroundに切り替えする時、バッジとメッセージを更新する。
  async _updateBadgeForBackend() {
    const sNoticeBackCounts = await AsyncStorage.getItem('FirebaseNoticeBackCount');
    const sQuestionnaireBackCounts = await AsyncStorage.getItem('FirebaseQuestionnaireBackCount');

    const sDisasterBackCounts = await AsyncStorage.getItem('FirebaseDisasterBackCount');
    const sWhoMessage = await AsyncStorage.getItem('FirebaseBackendWhoMessage');
    datas = this.state.data;

    let iNewNoticeBadgeCount = 0;
    let iNewQuestionnaireBadgeCount = 0;
    let iNewDisasterBackCount = 0;

    console.log("バックエンド-> お知らせのバッジ数 : ", sNoticeBackCounts);
    console.log("バックエンド-> アンケートのバッジ数 : ", sQuestionnaireBackCounts);
    console.log("バックエンド-> 災害情報のバッジ数 : ", sDisasterBackCounts);
    console.log("バックエンド-> メッセージ : ", sWhoMessage);

    // お知らせの場合
    if (sNoticeBackCounts !== null) {
      let iNoticeBackCounts = parseInt(sNoticeBackCounts);
      console.log("現在お知らせのバッジの数 : ", datas[0].menu, datas[0].badge);

      if (iNoticeBackCounts != 0) {
        let iTotalCount = 0;
        if (datas[0].badge == "99+") {
          iTotalCount = iNoticeBackCounts + 99;
        }
        else {
          iTotalCount = iNoticeBackCounts + parseInt(datas[0].badge);
        }

        if (iTotalCount > 99) {
          iNewNoticeBadgeCount = "99+"
        }
        else if (iTotalCount > 0) {
          iNewNoticeBadgeCount = iTotalCount;
        }
        else {
          iNewNoticeBadgeCount = 0;
        }

        datas[0].badge = iNewNoticeBadgeCount;
      }
    }

    // アンケートの場合
    if (sQuestionnaireBackCounts !== null) {
      let iQuestionnaireBackCounts = parseInt(sQuestionnaireBackCounts);
      console.log("現在アンケートのバッジの数 : ", datas[4].menu, datas[4].badge);

      if (iQuestionnaireBackCounts != 0) {
        let iTotalCount = 0;

        if (datas[4].badge == "99+") {
          iTotalCount = iQuestionnaireBackCounts + 99;
        }
        else {
          iTotalCount = iQuestionnaireBackCounts + parseInt(datas[4].badge);
        }

        if (iTotalCount > 99) {
          iNewQuestionnaireBadgeCount = "99+"
        }
        else if (iTotalCount > 0) {
          iNewQuestionnaireBadgeCount = iTotalCount;
        }
        else {
          iNewQuestionnaireBadgeCount = 0;
        }

        datas[4].badge = iNewQuestionnaireBadgeCount;
      }
    }

    // 災害情報の場合
    if (sDisasterBackCounts !== null) {
      let iDisasterBackCounts = parseInt(sDisasterBackCounts);
      console.log("現在アンケートのバッジの数 : ", datas[1].menu, datas[1].badge);

      if (iDisasterBackCounts != 0) {
        let iTotalCount = 0;

        if (datas[1].badge == "99+") {
          iTotalCount = iDisasterBackCounts + 99;
        }
        else {
          iTotalCount = iDisasterBackCounts + parseInt(datas[1].badge);
        }

        if (iTotalCount > 99) {
          iNewDisasterBackCount = "99+"
        }
        else if (iTotalCount > 0) {
          iNewDisasterBackCount = iTotalCount;
        }
        else {
          iNewDisasterBackCount = 0;
        }

        datas[1].badge = iNewDisasterBackCount;
      }
    }

    if ((sNoticeBackCounts !== null && sNoticeBackCounts != "0") || (sQuestionnaireBackCounts !== null && sQuestionnaireBackCounts != "0")
      || (sDisasterBackCounts !== null && sDisasterBackCounts != "0")
    ) {
      this.setState({ data: datas });
      console.log("_updateBadgeForBackend　:　バッジを更新しました。");

      await AsyncStorage.setItem('FirebaseNoticeBackCount', "0");
      await AsyncStorage.setItem('FirebaseQuestionnaireBackCount', "0");
      await AsyncStorage.setItem('FirebaseDisasterBackCount', "0");
      //await AsyncStorage.setItem('FirebaseBackendWhoMessage', "");
    }

    // メッセージを更新する
    this._updateMessage();
  }

  // 新着メッセージの内容を更新する
  _updateMessage() {
    // 新着件数がある場合 災害情報＞お知らせ＞アンケートの優先度で新着通知メッセージを表示（言語別）
    const noticeCounts = this.state.data[0].badge;  // お知らせバッジ
    const disasterCounts = this.state.data[1].badge;  // 災害情報バッジ
    const questionnaireCounts = this.state.data[4].badge;  // アンケートバッジ

    console.log("新着メッセージの内容更新-> お知らせバッジ   : ", noticeCounts);
    console.log("新着メッセージの内容更新-> 災害情報バッジ   : ", disasterCounts);
    console.log("新着メッセージの内容更新-> アンケートバッジ : ", questionnaireCounts);

    let displayMessage = "";
    if (disasterCounts != 0) {
      displayMessage = i18n.t('HBA-0000-newDisaster');     // 新着災害情報があります
    }
    else if (noticeCounts != 0) {
      displayMessage = i18n.t('HBA-0000-newNotice');       // 新着お知らせがあります
    }
    else if (questionnaireCounts != 0) {
      displayMessage = i18n.t('HBA-0000-newQuestionary');  // 新着アンケートがあります
    }
    else {
      displayMessage = "";
    }

    this.setState({ newMessage: displayMessage });
  }

  componentWillUnmount() {
    try {
      this._unsubscribe1();
      this._unsubscribe2();
      AppState.removeEventListener("change", this._handleAppStateChange);
    }
    catch (e) {
      console.log("TOP画面->componentWillUnmount: エラーが発生しました。", e);
    }
  }

  async loadFonts() {
    await Font.loadAsync({
      Roboto: require("../../node_modules/native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("../../node_modules/native-base/Fonts/Roboto_medium.ttf"),
    });
    this.setState({ isReady: true });
  }

  // テスト用 oushibu　バッジ更新処理テスト用 (現在途中になっている)
  onTestPress = () => {
    //console.log("テスト用(onTestPress) : ",this.state.data);
    let rtnIfUpdate = false;
    //rtnIfUpdate = updateBadge(this.state.data,0,"Add"); // お知らせバッジ更新
    rtnIfUpdate = updateBadge(this.state.data, 4, "Delete"); // アンケートバッジ更新

    console.log("onTestPress -> rtnIfUpdate ", rtnIfUpdate)

    if (rtnIfUpdate) {
      console.log("onTestPress -> バッジの件数を更新する ")
      this.setState({ data: this.state.data });
    }
    else {
      console.log("onTestPress -> バッジの件数を更新しない ")
    }
  }

  // [*] 画面描画設定
  renderItem(item) {
    return (
      <View
        style={
          this.state.data.findIndex((v) => v.menu === item.menu) % 3 !== 0
            ? styles.renderItemViewLeft
            : styles.renderItemView
        }
      >
        <IconBadge    //メニューボタンの定義
          MainElement={
            <ImageBackground
              style={styles.flatlistItemImageBackground}
              source={require("../../assets/image/top/button_icon.png")}
            >
              <View //ボタン画像に載せるアイコン画像の縮尺
                style={{ width: "100%" }}
              >
                <SafeAreaView>
                  <TouchableOpacity onPress={() => { this.onPress(item.menu); }}>
                    <View style={styles.flatlistItemView}>
                      <Image style={styles.flatlistItemImage} source={item.icon} />
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                        <Text style={styles.flatlistItemText}>
                          {item.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </SafeAreaView>
              </View>
            </ImageBackground>
          }

          // バッジの設定
          BadgeElement={<Text style={{ color: "#FFFFFF" }}>{item.badge}</Text>}
          IconBadgeStyle={styles.iconBadgeStyle}
          Hidden={item.badge == 0}
        />
      </View>
    );
  }

  // [*] 画面描画実行
  render() {
    if (!this.state.isReady) {
      return <View></View>;
    }
    return (
      <Grid>
        {/* ▼ 新着メッセージ表示エリア */}
        <Row size={10}>
          <View style={styles.container}>
            { /* <Button title="更新バッジ" onPress={()=>{this.onTestPress();}}/> */}
            <Text style={styles.noticeMessageText}>
              {this.state.newMessage}
            </Text>
          </View>
        </Row>

        {/* ▼ メニューボタン表示エリア */}
        <Row size={85}>

          {/* 手帳閲覧ボタン */}
          <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={styles.rightContainer}>
              <TouchableOpacity onPress={() => { this.props.navigation.navigate("NoteBookViewScreen"); }}>
                <ImageBackground
                  style={styles.handbookButtonImageBackground}
                  source={require("../../assets/image/top/top_setting.png")}
                >
                  <Image
                    style={styles.handbookButtonImage}
                    source={require("../../assets/image/0000/HandBook.png")}
                  />
                  <Text style={styles.title}>
                    {i18n.t('HBA-0000-btnHandbookView')}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>

            {/* 各種メニューボタン */}
            <FlatList
              style={styles.flatlist}
              numColumns={3} //3列
              data={this.state.data.filter((item) => item.isShow)}
              renderItem={({ item }) => this.renderItem(item)}
              keyExtractor={(item) => item.menu}
              onPress={this.onPressItem}
              scrollEnabled = {false}
            />

          </View>
        </Row>

        {/* アプリバージョン表示 */}
        <Row size={5} style={{ justifyContent: 'center',alignItems: 'center' }}>
          {/* <View  style={{alignSelf:'flex-end'}}> */}
          <Text style={styles.appVersionText}>外国人技能実習機構(OTIT)  Ver 1.0.0</Text>
          {/* </View> */}
        </Row>

      </Grid>
    );
  }
}

// [*] Style設定
const styles = ScaledSheet.create({
  renderItemViewLeft: {
    width: "33%",
    marginLeft: 0,
  },
  renderItemView: {
    width: "33%",
    marginLeft: 0,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    marginTop: 0,
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  thumbnail: { //緑アイコンのサイズ
    width: 53,
    height: 53,
    marginLeft: 10,
  },
  rightContainer: { //手帳閲覧のセクション
    //flex: 1,
    justifyContent: "center",
    marginTop: 5,
    marginLeft: 0,
    marginRight: 0,
    alignItems: "center",
    height: '115@vs', 
  },
  title: { //手帳閲覧セクションの設定
    fontSize: '11@s',      // 手帳閲覧　Font-size 11
    marginBottom: 8,
    marginLeft: 0,
    marginTop: 2,
    textAlign: "center",
  },
  year: {
    marginLeft: 50,
    textAlign: "left",
  },

  // お知らせメッセージ
  noticeMessageText : {
    marginTop: 0, 
    marginRight: 0, 
    marginLeft: 0, 
    fontSize: '19@s',      // メッセージ Font-size  '19@ms'
    color: "red" 
  },

  // 手帳閲覧ボタン: 背景
  handbookButtonImageBackground : {
    flex: 1,
    marginLeft: 50, 
    marginRight: 50, 
    marginTop: '15@s', 
    borderRadius: 20,
    width: '320@s',   // 長さ
    height:'100@vs',   // 高さ
    overflow: "hidden", 
    alignItems: "center"
  },
  handbookButtonImage : {   // ICON
    width: '53@s', 
    height: '53@s',
    marginTop: '10@s', 
  },

  flatlist : {
    marginTop: 5, 
    marginLeft: 10, 
    marginRight: 10, 
    //fontSize: 15
  },
  flatlistItemImageBackground :{ // お知らせボタン ⇒ 通知設定 背景
    flex: 1, 
    width: '100@s', 
    height: '100@vs', 
    marginLeft: '8@ms', 
    marginTop: 8, 
    borderRadius: 20, 
    overflow: "hidden" 
  },
  flatlistItemView : {
    justifyContent: "center", 
    alignItems: "center", 
    height: '100@s',
    //ackgroundColor :'green',
  },
  flatlistItemImage :{   // お知らせボタン ⇒ 通知設定　写真のサイズ
    width: '50@s', 
    height: '50@vs',
    //backgroundColor : 'red',
  },
  flatlistItemText : {
    textAlign: "center", 
    marginTop: 0,
    fontSize : 11,
    //backgroundColor : 'blue'
  },

  // バッジ
  iconBadgeStyle : {
    top: '5@ms', 
    right: '-5@ms', 
    width: '30@s', 
    height: '30@vs', 
    backgroundColor: "#FF0000"
  },

  // Appバージョン情報
  appVersionText : {
    marginLeft: '10@ms', 
    marginBottom: '5@ms',
    fontSize : '15@s', // バージョン情報　文字 Font-size
  },
});
