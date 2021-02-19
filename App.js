import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity,Linking, } from "react-native";
import { createAppContainer, StackActions, NavigationActions, DrawerNavigator, } from "react-navigation";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Container, Header, Content, Icon, Title } from "native-base";
import { Button, Right, ListItem, Left } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

import appConfig from './app.json';

console.log("App.js   画面を起動します。");

//HBA-0000：トップメニュー
import HomeScreen from "./components/topMenu/top";
//HBA-0200：お知らせ
import NoticeScreen from "./components/notification/notice_list";//お知らせ一覧
import NoticeDetailScreen from "./components/notification/notice_detail"; //お知らせ詳細
//HBA-0800：言語設定
import LanguagesScreen from "./components/setting/language";
import LanguageSettingScreen from "./components/setting/language_setting";

//HBA-1000：利用規約
import PolicyScreen from "./components/common/policy";
import PermissionAndroidViewScreen from "./components/common/permissionAndroidView";
//HBA-0300：災害情報
import DisasterListScreen from "./components/disaster/disaster_list";
//HBA-0310：災害詳細
import DisasterDetailScreen from "./components/disaster/disaster_detail";
//HBA-0400：事務所検索
import OfficeScreen from "./components/orgOffice/office_list";
import ShowMap from "./components/orgOffice/office_map";
//HBA-0700：ヘルプ
import HelpScreen from "./components/helps/help";
import HelpDetailScreen from "./components/helps/help_detail";
//HBA-0900：災害通知設定
import NoticeSetScreen from "./components/setting/notice_setting";
//HBA-0500：アンケート
import QuestionnaireScreen from "./components/questionnaire/questionnaire_list";
import QuestionnaireAnswerScreen from "./components/questionnaire/questionnaire_answer";
//HBA-0600：アプリ共有
import ShareScreen from "./components/appShare/sns_share";

// HBA-0100：手帳閲覧
import NoteBookViewScreen from "./components/handbook/notebook_view";
//HBA-0910：通知地点選択
import Prefectures from './components/setting/prefectures'; //都道府県リスト選択
import Cities from './components/setting/cities'; //市町村リスト選択
import Villages from './components/setting/villages'; //村域以下リスト選択

// OSS一覧画面
import OssScreen from "./components/common/oss";

import {GetTalkURL} from './components/common/utils'

//多言語文言
import i18n from 'i18n-js';
import ja_JP from './i18n/jpn.json'; //日本語
import en_US from './i18n/eng.json'; //英語
import vi_VN from './i18n/vie.json'; //ベトナム語
import zh_CN from './i18n/zho.json'; //中国語（簡体中国語）
import ph_PH from './i18n/phi.json'; //フィリピン語
import id_ID from './i18n/ind.json'; //インドネシア語
import th_TH from './i18n/tha.json'; //タイ語
import km_KH from './i18n/khm.json'; //カンボジア語
import my_MM from './i18n/mya.json'; //ミャンマー語（ビルマ語）
import mn_MN from './i18n/mon.json'; //モンゴル語
import { setState } from "expect";
import { color } from "react-native-reanimated";

// [*] 言語設定
i18n.translations = {
  ja: ja_JP,
  en: en_US,
  vi: vi_VN,
  zh: zh_CN,
  ph: ph_PH,
  id: id_ID,
  th: th_TH,
  km: km_KH,
  my: my_MM,
  mn: mn_MN
};

// [*] フォント設定
const defaultFontFamily = {
  ...Platform.select({
    android: { fontFamily: "" },
  }),
};

// [*]
const oldRender = Text.render;
Text.render = function (...args) {
  const origin = oldRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [defaultFontFamily, origin.props.style],
  });
};

// [NAV]
let homeOption = {
  title: "",
  headerShown: false,
};

// [NAV] TOPヘッダーベース             (ヘッダー非表示)
let titleBarInitialBase = (navigation, title) => ({
  title: title.length > 0 ? title : "",
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
});

/*
// [NAV] TOPヘッダー左右アイコン設定 1  (ヘッダータイトル非表示)
let titleBarButtonOption = (navigation) => ({
  title: "",
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
      <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
    </TouchableOpacity>
  ),
  headerRight: () => (
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
    </TouchableOpacity>
  ),
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
  headerTitleStyle: {
    fontSize : 12
  },
});
*/

// [NAV] TOPヘッダーベース   (初回起動画面用)
let titleBarForFirstStart = (navigation, title) => ({
  title: title,
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
  headerTitleStyle: {
    fontSize : scale(15)
  },
});


// [NAV] TOPヘッダー左右アイコン設定 2 (各画面用)
let titleBarButtonOptionTitle = (navigation, title) => ({
  title: title,
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
      <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
    </TouchableOpacity>
  ),
  headerRight: () => (
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
    </TouchableOpacity>
  ),
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
  headerTitleStyle: {
    fontSize : scale(10),
  },
});

// [NAV] TOPヘッダー左右アイコン設定 3 (トップ画面用)
let titleBarButtonOptionTop = (navigation) => ({
  //技能実習生手帳
  headerTitle: () => (
    <View style={{alignItems:'center',alignContent:'center',flex:0}}>
      <Text style={{fontWeight:'bold',alignContent:'center',textAlignVertical:'center',fontSize:scale(10),color:'#fff'}}>{i18n.t('HBA-0000-title')}</Text>
    </View>
  ),
  headerLeft: () => (
    <Icon name="book" style={{ marginLeft: 20,marginRight : 0, color: 'white',}} type="Octicons" />
  ),
  headerRight: () => (
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Icon name="menu" style={{ marginRight: 20, color: 'white',}} type="MaterialIcons" />
    </TouchableOpacity>
  ),
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
  headerTintColor: '#fff',
});

// [NAV] TOPヘッダー左右アイコン設定 4 (言語設定画面(手動))
let titleBarButtonOptionPlus = (navigation, title) => ({
  title: title,
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
      <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
    </TouchableOpacity>
  ),
  headerRight: () => (
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Button transparent style={{ marginRight: 10 }} onPress={() => navigation.navigate("HomeScreen")}></Button>
      <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
    </TouchableOpacity>
  ),
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#008348',
  },
  headerTitleStyle: {
    fontSize : scale(15)
  },
});

// [+] 言語設定画面
const LanguageSettingStack = createStackNavigator();
function LanguageSettingStackScreen() {
  <LanguageSettingStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <LanguageSettingStack.Screen
      name="LanguageSettingScreen"
      component={LanguageSettingScreen}
      //通知設定
      options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0000-btnNoticeSettin'))}
    />
  </LanguageSettingStack.Navigator>
}

// [+] 言語設定画面(初回起動用)
const FSLanguageSettingStack = createStackNavigator();
function FirstStartLanguageSettingScreen() {
  return (
    <FSLanguageSettingStack.Navigator>
      <FSLanguageSettingStack.Screen
        name="LanguageSettingScreen"
        component={LanguageSettingScreen}
        options={({ navigation, route }) => titleBarForFirstStart(navigation, i18n.t('HBA-0000-btnLangSetting'))}
      />
    </FSLanguageSettingStack.Navigator>
  );
}

// [-] 通知言語設定
const LanguageRuleStack = createStackNavigator();
function LanguageRuleStackScreen() {
  <LanguageRuleStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <LanguageRuleStack.Screen
      name="LanguageRuleScreen"
      component={LanguageRuleScreen}
      //通知設定
      options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0000-btnNoticeSettin'))}
    />
  </LanguageRuleStack.Navigator>
}

// [+] トップメニュー画面
const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <HomeStack.Screen
        name="home"
        component={HomeScreen}
        options={({ navigation, route }) => titleBarButtonOptionTop(navigation)}
      />
    </HomeStack.Navigator>
  );
}

// [+] お知らせ画面
const NoticeStack = createStackNavigator();
function NoticeStackScreen() {
  return (
    <NoticeStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <NoticeStack.Screen
        name="NoticeScreen"
        component={NoticeScreen}
        //お知らせ一覧
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0200-noticeList'))}
      />

      <NoticeStack.Screen
        name="NoticeDetailScreen"
        component={NoticeDetailScreen}
        //お知らせ詳細
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0210-noticeDetails'))}
        // options={({ navigation, route }) => ({
        //   //お知らせ詳細
        //   title: i18n.t('HBA-0210-noticeDetails'), headerTintColor: 'white', headerTitleAlign: 'center',
        //   headerLeft: () => (
        //     <TouchableOpacity onPress={() => navigation.navigate("NoticeScreen",{Action : "ReturnNoticeList"})}>
        //       <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
        //     </TouchableOpacity>
        //   ),
        //   headerRight: () => (
        //     <TouchableOpacity onPress={() => navigation.openDrawer()}>
        //       <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
        //     </TouchableOpacity>
        //   ),
        //   headerTitleAlign: 'center',
        //   headerStyle: {
        //     backgroundColor: '#008348',
        //   },
        // })}
      />
    </NoticeStack.Navigator>
  );
}

// [+] 手帳閲覧画面
const NoteBookViewStack = createStackNavigator();
function NoteBookViewStackScreen() {
  return (
    <NoteBookViewStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <NoteBookViewStack.Screen
        name="NoteBookViewScreen"
        component={NoteBookViewScreen}
        //手帳閲覧
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-2000-handbookView'))}
      />
    </NoteBookViewStack.Navigator>
  );
}

// [+] 災害情報画面
const DisasterListStack = createStackNavigator();
function DisasterListStackScreen() {
  return (
    <DisasterListStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <DisasterListStack.Screen
        name="DisasterListScreen"
        component={DisasterListScreen}
        //災害情報一覧
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0300-disasterList'))}
      />
      <DisasterListStack.Screen
        name="DisasterDetailScreen"
        component={DisasterDetailScreen}
        options={({ navigation, route }) => ({
          //災害情報詳細
          title: i18n.t('HBA-0310-disasterDetails'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("DisasterListScreen")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ), headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },
        })}
      />
    </DisasterListStack.Navigator>
  );
}

// [+] 事務所検索画面
const OfficeStack = createStackNavigator();
function OfficeStackScreen() {
  return (
    <OfficeStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <OfficeStack.Screen
        name="OfficeScreen"
        component={OfficeScreen}
        //事務所一覧
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0400-officeList'))}
      />
      <OfficeStack.Screen
        name="ShowMap"
        component={ShowMap}
        options={({ navigation, route }) => ({
          title: i18n.t('HBA-0400-office'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("OfficeScreen",{Action : "ReturnOfficeList"})}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#008348',
          },
        })}
      />
    </OfficeStack.Navigator>
  );
}

// [+] 母国語相談画面
const HomelandStack = createStackNavigator();
function HomelandStackScreen() {
  return (
    <HomelandStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <HomelandStack.Screen
        name="HomelandScreen"
        component={HomelandScreen}
        //母国語相談
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-2000-consultation'))}
      />
    </HomelandStack.Navigator>
  );
}

// [+] 利用規約画面
const PolicyStack = createStackNavigator();
function PolicyStackScreen() {
  return (
    <PolicyStack.Navigator>
      <PolicyStack.Screen
        name="PolicyScreen"
        component={PolicyScreen}
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-2000-policy'))}
      />
    </PolicyStack.Navigator>
  );
}

// [+] 利用規約画面(初回起動用)
const FSPolicyStack = createStackNavigator();
function FirstStartPolicyScreen() {
  return (
    <FSPolicyStack.Navigator>
      <FSPolicyStack.Screen
        name="PolicyScreen"
        component={PolicyScreen}
        options={({ navigation, route }) => titleBarForFirstStart(navigation,  i18n.t('HBA-2000-policy'))}
      />
    </FSPolicyStack.Navigator>
  );
}

// [+] OSS ライセンス一覧
const OssStack = createStackNavigator();
function OssStackScreen() {
  return (
    <OssStack.Navigator>
      <OssStack.Screen
        name="OssScreen"
        component={OssScreen}
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, "OSS License List")}
      />
    </OssStack.Navigator>
  );
}

// [+] アンケート画面
const QuestionnaireStack = createStackNavigator();
function QuestionnaireStackScreen() {
  return (
    <QuestionnaireStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <QuestionnaireStack.Screen
        name="QuestionnaireScreen"
        component={QuestionnaireScreen}
        //アンケート一覧
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0500-questionnaireList'))}

      />
      <QuestionnaireStack.Screen
        name="QuestionnaireAnswerScreen"
        component={QuestionnaireAnswerScreen}
        //アンケート情報回答
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0500-questionnaireList'))}
      />
    </QuestionnaireStack.Navigator>
  );
}

// [+] アプリ共有画面
const ShareStack = createStackNavigator();
function ShareStackScreen() {
  return (
    <ShareStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <ShareStack.Screen
        name="ShareScreen"
        component={ShareScreen}
        //アプリ共有
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0600-appShare'))}
      />
    </ShareStack.Navigator>
  );
}

// [+] ヘルプ画面
const HelpStack = createStackNavigator();
function HelpStackScreen() {
  return (
    <HelpStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <HelpStack.Screen
        name="HelpScreen"
        component={HelpScreen}
        //ヘルプ・FAQ
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0700-helpAndFaq'))}
      />
      <HelpStack.Screen
        name="HelpDetailScreen"
        component={HelpDetailScreen}
        options={({ navigation, route }) => ({ title: "" })}
      />
    </HelpStack.Navigator>
  );
}

// [+] 言語設定画面
const LanguagesStack = createStackNavigator();
function LanguagesStackScreen() {
  return (
    <LanguagesStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <LanguagesStack.Screen
        name="LanguagesScreen"
        component={LanguagesScreen}
        //言語設定
        options={({ navigation, route }) => titleBarButtonOptionPlus(navigation, i18n.t('HBA-0000-btnLangSetting'))}
      />
    </LanguagesStack.Navigator>
  );
}

// [+] 通知設定画面
const NoticeSetStack = createStackNavigator();
function NoticeSetStackScreen() {
  return (
    <NoticeSetStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <NoticeSetStack.Screen
        name="NoticeSetScreen"
        component={NoticeSetScreen}
        //通知設定
        options={({ navigation, route }) => titleBarButtonOptionTitle(navigation, i18n.t('HBA-0000-btnNoticeSetting'))}
      />

      <NoticeSetStack.Screen
        name="Prefectures"
        component={Prefectures}
        options={({ navigation, route }) => ({
          //通知地点選択（都道府県）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("NoticeSetScreen")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },
        })}
      />
      <NoticeSetStack.Screen
        name="Cities"
        component={Cities}
        options={({ navigation, route }) => ({
          //通知地点選択（市町村）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Prefectures")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/ 
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },
        })}
      />
      <NoticeSetStack.Screen
        name="Villages"
        component={Villages}
        options={({ navigation, route }) => ({
          //通知地点選択（村域以下）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Cities")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/ 
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },
        })}
      />
    </NoticeSetStack.Navigator>
  );
}

// [+] 通知設定画面(初回起動用)
const FSNoticeSetStack = createStackNavigator();
function FirstStartNoticeSetScreen() {
  return (
    <FSNoticeSetStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
      <FSNoticeSetStack.Screen
        name="NoticeSetScreen"
        component={NoticeSetScreen}
        //通知設定
        options={({ navigation, route }) => titleBarForFirstStart(navigation, i18n.t('HBA-0000-btnNoticeSetting'))}
      />

      <FSNoticeSetStack.Screen
        name="Prefectures"
        component={Prefectures}
        options={({ navigation, route }) => ({
          //通知地点選択（都道府県）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("NoticeSetScreen")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/ 
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },          
        })}
      />
      <FSNoticeSetStack.Screen
        name="Cities"
        component={Cities}
        options={({ navigation, route }) => ({
          //通知地点選択（市町村）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Prefectures")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/ 
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },          
        })}
      />
      <FSNoticeSetStack.Screen
        name="Villages"
        component={Villages}
        options={({ navigation, route }) => ({
          //通知地点選択（村域以下）
          title: i18n.t('HBA-0910-pointChoice'), headerTintColor: 'white', headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Cities")}>
              <Icon name="chevron-left" style={{ marginLeft: 20, color: 'white' }} type="FontAwesome5" />
            </TouchableOpacity>
          ),
          /*
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon name="menu" style={{ marginRight: 20, color: 'white' }} type="MaterialIcons" />
            </TouchableOpacity>
          ),*/ 
          headerStyle: {
            backgroundColor: '#008348',
          },
          headerTitleStyle: {
            fontSize : scale(10),
          },          
        })}
      />
    </FSNoticeSetStack.Navigator>
  );
}

// [+]プッシュ通知
const permissionAndroidViewStack = createStackNavigator();
function permissionAndroidScreen() {
  <permissionAndroidViewStack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <permissionAndroidViewStack.Screen
      name="PermissionAndroidViewScreen"
      component={PermissionAndroidViewScreen}
      options={({ navigation, route }) => titleBarInitialBase(navigation)}
    />
  </permissionAndroidViewStack.Navigator>
}

// メニューの内容はカスタマイズする。
const getActiveRouteState = function (routes, index, name) {
  return routes[index].name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
};
function DrawerContent(props) {
  const activeColor   = '#b3ecff';
  const inActiveColor = '#ffffff'
  return (
    <View style={{ flex: 1 }}>  
      <DrawerContentScrollView {...props}>
        <View>
          <DrawerItem
            label='Home'                              // Home
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'Home'
            )}
            onPress={() => {
              props.navigation.navigate('HomeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label= {i18n.t('HBA-2000-handbookView')}  // 手帳閲覧
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoteBookViewScreen'
            )}
            onPress={() => {
              props.navigation.navigate('NoteBookViewScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-notice')}         // お知らせ
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoticeScreen'
            )}
            onPress={() => {
              props.navigation.navigate('NoticeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-disaster')}       // 災害情報
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'DisasterListScreen'
            )}
            onPress={() => {
              props.navigation.navigate('DisasterListScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-officeSearch')}   // 事務所検索
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'OfficeScreen'
            )}
            onPress={() => {
              props.navigation.navigate('OfficeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-consultation')}   // 母国語相談
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'LanuageTalk'
            )}
            onPress={async () => {
              props.navigation.closeDrawer();
              const talKURL = await GetTalkURL();
              Linking.openURL(talKURL);
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-questionary')}   // アンケート
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'QuestionnaireScreen'
            )}
            onPress={() => {
              props.navigation.navigate('QuestionnaireScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-appShare')}     // アプリ共有
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'ShareScreen'
            )}
            onPress={() => {
              props.navigation.navigate('ShareScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-helps')}        // ヘルプ
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'HelpScreen'
            )}
            onPress={() => {
              props.navigation.navigate('HelpScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-langSetting')}      // 言語設定(手動設定)
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'LanguagesScreen'
            )}
            onPress={() => {
              props.navigation.navigate('LanguagesScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-noticeSetting')}   // 通知設定
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoticeSetScreen'
            )}
            onPress={async () => {
              // 遷移元を保存する
              await AsyncStorage.setItem('MoveMoto','side_menu');
              props.navigation.navigate('NoticeSetScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-policy')}         // 利用規約
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'PolicyStackScreen'
            )}
            onPress={() => {
              props.navigation.navigate('PolicyStackScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
         {/*
          <DrawerItem
            label='OSS License List'         // OSS一覧
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'OssStackScreen'
            )}
            onPress={() => {
              props.navigation.navigate('OssStackScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label="初回起動"         // 初回起動->言語設定　テスト終わった後削除する。
            labelStyle = {{color:'white'}}
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'FirstStartLanguageSettingScreen'
            )}
            onPress={() => {
              AsyncStorage.clear(); // 端末に保存しているものをすべてクリアする　テスト用
              props.navigation.navigate('FirstStartLanguageSettingScreen');
            }}
          />
          */}
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

function DrawerContent2(props) {
  const activeColor   = '#b3ecff';
  const inActiveColor = '#ffffff'
  return (
    <View style={{ flex: 1 }}>  
      <DrawerContentScrollView {...props}>
        <View >
          <DrawerItem
            label='Home'                              // Home
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'Home'
            )}
            onPress={() => {
              props.navigation.navigate('HomeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label= {i18n.t('HBA-2000-handbookView')}  // 手帳閲覧
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoteBookViewScreen'
            )}
            onPress={() => {
              props.navigation.navigate('NoteBookViewScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-notice')}         // お知らせ
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoticeScreen'
            )}
            onPress={() => {
              props.navigation.navigate('NoticeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-disaster')}       // 災害情報
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'DisasterListScreen'
            )}
            onPress={() => {
              props.navigation.navigate('DisasterListScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-officeSearch')}   // 事務所検索
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'OfficeScreen'
            )}
            onPress={() => {
              props.navigation.navigate('OfficeScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-questionary')}   // アンケート
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'QuestionnaireScreen'
            )}
            onPress={() => {
              props.navigation.navigate('QuestionnaireScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-appShare')}     // アプリ共有
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'ShareScreen'
            )}
            onPress={() => {
              props.navigation.navigate('ShareScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-helps')}        // ヘルプ
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'HelpScreen'
            )}
            onPress={() => {
              props.navigation.navigate('HelpScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-langSetting')}      // 言語設定(手動設定)
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'LanguagesScreen'
            )}
            onPress={() => {
              props.navigation.navigate('LanguagesScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-noticeSetting')}   // 通知設定
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'NoticeSetScreen'
            )}
            onPress={async () => {
              // 遷移元を保存する
              await AsyncStorage.setItem('MoveMoto','side_menu');
              props.navigation.navigate('NoticeSetScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label={i18n.t('HBA-2000-policy')}         // 利用規約
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'PolicyStackScreen'
            )}
            onPress={() => {
              props.navigation.navigate('PolicyStackScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          {/*
          <DrawerItem
            label='OSS License List'         // OSS一覧
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'OssStackScreen'
            )}
            onPress={() => {
              props.navigation.navigate('OssStackScreen');
            }}
            activeBackgroundColor  = {activeColor}
            inactiveBackgroundColor= {inActiveColor}
          />
          <DrawerItem
            label="初回起動"         // 初回起動->言語設定　テスト終わった後削除する。
            labelStyle = {{color:'white'}}
            focused={getActiveRouteState(
              props.state.routes,
              props.state.index,
              'FirstStartLanguageSettingScreen'
            )}
            onPress={() => {
              AsyncStorage.clear(); // 端末に保存しているものをすべてクリアする　テスト用
              props.navigation.navigate('FirstStartLanguageSettingScreen');
            }}
          />
          */}
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

// [+] HBA-2000：サイドメニュー
const Drawer = createDrawerNavigator();

export default class AppEntry extends React.Component {
  constructor() {
    super();

    this.state = {
      screenId: 'ScreenID_APP',
      currentLan: i18n,
      talkURL : '',       // 母国語相談URL
      talkDisplay : false, // 母国語相談ボタンの表示と非表示
    }
  }

  async componentDidMount() {
    //言語設定取得
    const value = await AsyncStorage.getItem('lang');

    if (value !== null) {
      i18n.locale = value;
      console.log("App.js画面  componentDidMount　現在の言語:" + value);
    } else {
      i18n.locale = appConfig.language;
      console.log("App.js画面  componentDidMount　現在の言語:no select language");
    }

    // 日本語及びモンゴル語の場合は「母国語相談ボタン」は非表示になること
    let sTalkDisplay = false;
    if (value == "ja" || value == "mn") {
      sTalkDisplay = false;
    }
    else {
      sTalkDisplay = true;
    }

    this.setState({ currentLan: i18n, talkURL : GetTalkURL(value),talkDisplay : sTalkDisplay});
  }

  render() {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="HomeScreen"   // 初期起動：ホーム
          drawerPosition="right"
          drawerStyle={{
            //backgroundColor: '#c6cbef',
            width: this.state.currentLan.locale === 'my' ? 336 : 260,
          }}
          drawerContent={
            this.state.talkDisplay ? (props) => <DrawerContent {...props} />
            : (props) => <DrawerContent2 {...props} />
          }
        >
          <Drawer.Screen
            name="HomeScreen"
            component={HomeStackScreen}
            options={{ title: "Home" }}
          />
          <Drawer.Screen
            name="NoteBookViewScreen"
            component={NoteBookViewStackScreen}
            //手帳閲覧
            options={{ title: i18n.t('HBA-2000-handbookView') }}
          />
          <Drawer.Screen
            name="NoticeScreen"
            component={NoticeStackScreen}
            //お知らせ
            options={{ title: i18n.t('HBA-2000-notice') }}
          />
          <Drawer.Screen
            name="DisasterListScreen"
            component={DisasterListStackScreen}
            //災害情報
            options={{ title: i18n.t('HBA-2000-disaster') }}
          />
          <Drawer.Screen
            name="OfficeScreen"
            component={OfficeStackScreen}
            //事務所検索
            options={{ title: i18n.t('HBA-2000-officeSearch') }}
          />
          <Drawer.Screen
            name="HomelandScreen"
            component={HomelandStackScreen}
            //母国語相談
            options={{ title: i18n.t('HBA-2000-consultation') }}
          />
          <Drawer.Screen
            name="QuestionnaireScreen"
            component={QuestionnaireStackScreen}
            //アンケート
            options={{ title: i18n.t('HBA-2000-questionary') }}
          />
          <Drawer.Screen
            name="ShareScreen"
            component={ShareStackScreen}
            //アプリ共有
            options={{ title: i18n.t('HBA-2000-appShare') }}
          />
          <Drawer.Screen
            name="HelpScreen"
            component={HelpStackScreen}
            //ヘルプ
            options={{ title: i18n.t('HBA-2000-helps') }}
          />
          <Drawer.Screen
            name="LanguagesScreen"
            component={LanguagesStackScreen} 
            listeners={ ({ navigation, route }) => ({
              blur: e => {
                // Prevent default action
                //e.preventDefault();

                // サイドメニューのtitleを変更する
                const ChangSideMenu = async () => {
                  const currentLang = await AsyncStorage.getItem('lang');
                  //console.log("currentLang : ",currentLang);
                  i18n.locale = currentLang;

                  //日本語及びモンゴル語の場合は「母国語相談ボタン」は非表示になること
                  let sTalkDisplay = false;
                  if (currentLang == "ja" || currentLang == "mn") {
                    sTalkDisplay = false;
                  }
                  else {
                    sTalkDisplay = true;
                  }
                  this.setState({currentLan: i18n,talkDisplay : sTalkDisplay});
                }

                ChangSideMenu();
              },
            })}
            //言語設定
            options={{ title: i18n.t('HBA-2000-langSetting') }}
          />
          <Drawer.Screen
            name="NoticeSetScreen"
            component={NoticeSetStackScreen}
            //通知設定
            options={{ title: i18n.t('HBA-2000-noticeSetting') }}
          />
          <Drawer.Screen
            name="PolicyStackScreen"
            component={PolicyStackScreen}
            //利用規約
            options={{ title: i18n.t('HBA-2000-policy')}}
          />
          <Drawer.Screen                // OSSライセンス一覧
            name="OssStackScreen"
            component={OssStackScreen}
            options={{ title: 'OSS License List'}}
          />          
          <Drawer.Screen
            // 初回起動用: 言語設定画面
            name="FirstStartLanguageSettingScreen"
            component={FirstStartLanguageSettingScreen}
            listeners={ ({ navigation, route }) => ({
              blur: e => {
                // Prevent default action
                //e.preventDefault();

                // サイドメニューのtitleを変更する
                const ChangSideMenu = async () => {
                  const currentLang = await AsyncStorage.getItem('lang');
                  //console.log("初回起動用言語設定画面 currentLang : ",currentLang);
                  i18n.locale = currentLang;

                  //日本語及びモンゴル語の場合は「母国語相談ボタン」は非表示になること
                  let sTalkDisplay = false;
                  if (currentLang == "ja" || currentLang == "mn") {
                    sTalkDisplay = false;
                  }
                  else {
                    sTalkDisplay = true;
                  }

                  this.setState({currentLan: i18n,talkDisplay : sTalkDisplay});
                }

                ChangSideMenu();
              },
            })}
            options={{
              drawerLabel: () => null,
              title: null,
              drawerIcon: () => null
            }}
          />
          <Drawer.Screen
            // 初回起動用 : 利用規約画面
            name="FirstStartPolicyScreen"
            component={FirstStartPolicyScreen}
            options={{
              drawerLabel: () => null,
              title: null,
              drawerIcon: () => null
            }}
          />
          <Drawer.Screen
            // 初回起動用 : 通知設定画面
            name="FirstStartNoticeSetScreen"
            component={FirstStartNoticeSetScreen}
            options={{
              drawerLabel: () => null,
              title: null,
              drawerIcon: () => null
            }}
          />
          <Drawer.Screen
            // 初回起動用プッシュ通知設定画面
            name="PermissionAndroidViewScreen"
            component={PermissionAndroidViewScreen}
            options={{
              drawerLabel: () => null,
              title: null,
              drawerIcon: () => null
            }}
          />    
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }
}

// Style設定
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
