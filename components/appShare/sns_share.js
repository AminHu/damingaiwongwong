/*
 * モジュール名 : アプリ共有コンポーネント
 * 作成日 ：2020/11/25
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Container, Content, Button, ListItem, Text, Left, Body, Right, Icon } from 'native-base';
import { Linking, Alert, Platform } from 'react-native';
import Communications from 'react-native-communications';
import Clipboard from '@react-native-community/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';
import appConfig from '../../app.json';
import { AppInstalledChecker } from 'react-native-check-app-install';
import { LoginManager, ShareDialog } from "react-native-fbsdk";

const shareURL = Platform.OS === "ios" ? appConfig.AppStorURL_iOS :appConfig.AppStorURL_Android;
const shareLinkContent = {
  contentType: 'link',
  contentUrl: shareURL,
  contentDescription: i18n.t('HBA-0600-msgShare'),
};

//コンポーネントの内容を定義
export default class ShareScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0600',
      currentLang: i18n.locale,
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する アプリ共有
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0600-appShare') });

      const langValue = await AsyncStorage.getItem('lang');
      i18n.locale = langValue;

      this.setState({ currentLang:i18n.locale});
    });
  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
  }

  // [*] アプリインストールチェック
  checkAppInstalled(appName) {
    try {
      var rtnResult = AppInstalledChecker
        .isAppInstalled(appName)
        .then((isInstalled) => {
          return isInstalled;
        });
    } catch (e) {
      return false;
    }
    return rtnResult;
  }

  // [*] イベント処理:Facebookアプリ起動
  facebookLogin() {
    var loginResult = LoginManager.logInWithPermissions(["public_profile"]).then(
      (error) => {
        if (error) {
          return false;
        } else {
          return true;
        }
      });
    return loginResult;
  }

  // [*] イベント処理:アプリ共有
  shareLinkWithFacebook() {
    ShareDialog.canShow(shareLinkContent).then(
      canShow => {
        if (canShow) {
          return ShareDialog.show(shareLinkContent);
        }
      }
    ).then(
      (result) => {
        if (result.isCancelled) {
          console.log('cancel');
        } else {
          console.log('succes:' + result.postId);
        }
      },
      (error) => {
        console.log('error:' + error);
      }
    );
  }

  // [*] イベント処理:Facebookアプリ起動
  openShareFacebook() {
    let facebookParameters = [];
    const shareContent = i18n.t('HBA-0600-msgShare');

    //アプリインストールチェック
    if (this.checkAppInstalled('facebook')) {
      //ストアURL共有
      this.shareLinkWithFacebook();

    } else {
      Alert.alert(i18n.t('HBA-0600-msgNoInstaill'));
      shareURL && facebookParameters.push('u=' + encodeURI(shareURL));
      shareContent && facebookParameters.push('quote=' + encodeURI(shareContent));
      const url = 'https://www.facebook.com/sharer/sharer.php?' + facebookParameters.join('&');
      Linking.openURL(url).then((data) => {});
    }
  }

  // [*] イベント処理:Twitterアプリ起動
  openShareTwitter() {
    const twitterViaAccount = '';
    let twitterParameters = [];
    let url = 'https://twitter.com/intent/tweet?';
    const shareContent = i18n.t('HBA-0600-msgShare');

    //アプリインストールチェック
    if (this.checkAppInstalled('twitter')) {
       shareURL &&  twitterParameters.push('url=' + encodeURI(shareURL));
       shareContent && twitterParameters.push('text=' + encodeURI(shareContent));
        twitterViaAccount && twitterParameters.push('via=' + encodeURI(twitterViaAccount));
        url = url + twitterParameters.join('&');
        Linking.openURL(url) .then((data) => {});
    } else {
      Alert.alert(i18n.t('HBA-0600-msgNoInstaill'));
      Linking.openURL(url).then((data) => {});
    }
  }

  // [*] イベント処理:Lineアプリ起動
  openShareLine() {
    let lineParameters = [];
    const shareContent = i18n.t('HBA-0600-msgShare');

    shareURL && lineParameters.push(encodeURI(shareURL));
    shareContent && lineParameters.push(encodeURI(shareContent));
    const url = 'https://line.me/R/msg/text/?' + lineParameters.join(' ');

    Linking.openURL(url).then((data) => {})
      .catch(() => {
        Alert.alert(i18n.t('HBA-0600-msgNoInstaill'));
      });
  }

  // [*] イベント処理:メールアプリ起動
  openShareEmail() {
    const shareContent = i18n.t('HBA-0600-msgShare');
    
    Communications.email(
      '', 
      '', 
      '', 
      shareContent, //Subject
      shareURL      //Body
    );
  }

  // [*] イベント処理:リンクコピー
  writeToClipboard() {
    Clipboard.setString(shareURL);
    Alert.alert(i18n.t('HBA-0600-msgCopyUrl'));
  }

  //表示する要素を返す
  render() {
    return (
      <Container>
        <Content>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#008BBB" }} onPress={() => this.openShareFacebook()}>
                <Icon active name="logo-facebook" type="Ionicons"/>
              </Button>
            </Left>
            <Body>
              <Text onPress={() => this.openShareFacebook()}>
                {/* Facebook */}
                {i18n.t('HBA-0600-facebook')}
              </Text>
            </Body>
            <Right>
              <Icon active name="share" type="Entypo" onPress={() => this.openShareFacebook()} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#3399FF" }} onPress={() => this.openShareTwitter()}>
                <Icon active name="logo-twitter" type="Ionicons"/>
              </Button>
            </Left>
            <Body>
              <Text onPress={() => this.openShareTwitter()}>
                {/* Twitter */}
                {i18n.t('HBA-0600-twitter')}
              </Text>
            </Body>
            <Right>
              <Icon active name="share" type="Entypo" onPress={() => this.openShareTwitter()} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#00AA00" }} onPress={() => this.openShareLine()}>
                <Icon active name="line" type="FontAwesome5" />
              </Button>
            </Left>
            <Body>
              <Text onPress={() => this.openShareLine()}>
                {/* LINE */}
                {i18n.t('HBA-0600-line')}
              </Text>
            </Body>
            <Right>
              <Icon active name="share" type="Entypo" onPress={() => this.openShareLine()} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }} onPress={() => this.openShareEmail()}>
                <Icon active name="mail" type="Foundation"/>
              </Button>
            </Left>
            <Body>
              <Text onPress={() => this.openShareEmail()}>
                {/* メール */}
                {i18n.t('HBA-0600-email')}
              </Text>
            </Body>
            <Right>
              <Icon active name="share" type="Entypo" onPress={() => this.openShareEmail()} />
            </Right>
          </ListItem>

          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#0F0F0F" }} onPress={() => this.writeToClipboard()}>
                <Icon active name="copy1" type="AntDesign" />
              </Button>
            </Left>
            <Body>
              <Text onPress={() => this.writeToClipboard()}>
                {/* リンクコピー */}
                {i18n.t('HBA-0600-copy')}
              </Text>
            </Body>

          </ListItem>
        </Content>
      </Container>
    );
  }
}
