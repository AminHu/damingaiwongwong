/*
 * モジュール名 : ヘルプコンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from "react";
import { View, ScrollView } from "react-native";
import styles from "../common/style";
import { Container, Header, Tab, Tabs, ScrollableTab, Text } from 'native-base';
import NetInfo from "@react-native-community/netinfo";
import i18n from 'i18n-js';
import HelpDetail from './help_detail'
import { GetHelpData, GetFAQData } from './../common/database'
import Dialog from "react-native-dialog";
import { isEmpty } from '../common/utils';
import { ActivityIndicator } from "react-native";

//コンポーネントの内容を定義
export default class HelpScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0700',
      helpsData: [],
      faqData: [],
      isShowErrDialog: false,       //エラーダイアログ表示フラグ
      messageBody: '',
      isLoddngHelp: true,
      isLoddngFaq: true,
      currentTab: 0,
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する ヘルプ
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0700-helpAndFaq') });

      // インターネットが接続されているかチェックする
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {

          // ヘルプデータを取得する
          const helpsDatas = await GetHelpData();
          if (helpsDatas.success) {
            if (!isEmpty(helpsDatas.data)) {
              this.setState({ helpsData: helpsDatas.data });
            } else {
              this.setState({ helpsData: [] });
            }
            //データ取得完了
            this.setState({ isLoddngHelp: false });
          }
          else {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0700-msgErrHelp'));
          }

          // FAQデータを取得する
          const faqDatas = await GetFAQData();
          if (faqDatas.success) {
            if (!isEmpty(faqDatas.data)) {
              this.setState({ faqData: faqDatas.data });
            } else {
              this.setState({ faqData: [] });
            }
            //データ取得完了
            this.setState({ isLoddngFaq: false });
          }
          else {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0700-msgErrFAQ'));
          }

        }
        else {
          this.setState({ helpsData: [], faqData: [] });
          //エラーダイアログ表示
          if (this.state.currentTab == 0) {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0700-msgErrHelp'));
          }
          else {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0700-msgErrFAQ'));
          }
        }
      });

    });

    this._unsubscribe2 = this.props.navigation.addListener('blur', async () => {
      //console.log("ヘルプ画面からトップ画面に遷移する>>>>>>>>>>>>>>>>>>>>>>>>");

      //「Help」をデフォルトとして表示する。
      setTimeout(this._tabs.goToPage.bind(this._tabs,0));

      this.setState({helpsData: [] ,faqData: [] });
    });

  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
    this._unsubscribe2();
  }

  //[*]エラーダイアログ表示
  showErrDialog(message) {
    this.setState({ isShowErrDialog: true });
    this.setState({ messageBody: message });
  }
  handleError() {
    //TOPメニューに遷移
    this.props.navigation.navigate("HomeScreen");
    this.setState({ isShowErrDialog: false });
  }

  // [*] イベント処理:ヘルプ
  renderAccordiansHelp = () => {
    const items = [];
    {
      this.state.helpsData.map((value, index) => {
        return (
          items.push(
            <HelpDetail
              key={index}
              question={value.question}
              answer={value.answer}
            />))
      })
    }
    return items;
  }

  // [*] イベント処理:FAQ
  renderAccordiansFaq = () => {
    const items = [];
    {
      this.state.faqData.map((value, index) => {
        return (
          items.push(
            <HelpDetail
              key={index}
              question={value.question}
              answer={value.answer}
            />))
      })
    }
    return items;
  }

  // Tabを変更する
  changeTab(tabIndex) {
    //console.log("選択されているTab : ", tabIndex);
    this.setState({ currentTab: tabIndex });
    //initialPage={0} page={this.state.tabIndex}
  }

  //表示する要素を返す
  render() {
    const { helpsData, faqData, isShowErrDialog, messageBody, isLoddngHelp, isLoddngFaq } = this.state;

    return (
      <Container>
        <Header hasTabs style={styles.headerTab} />
        <Tabs renderTabBar={() => <ScrollableTab />} style={styles.tabStyle} onChangeTab={({ i }) => { this.changeTab(i); }} ref={component => this._tabs = component}>
          <Tab heading={i18n.t('HBA-0700-help')}>
            {isLoddngHelp ? <ActivityIndicator /> : (
              <ScrollView>
                {helpsData.length === 0 ?
                  <Text style={styles.messageText}>{i18n.t('HBA-0700-msgNoHelp')}</Text>
                  : (
                    <View>
                      {this.renderAccordiansHelp()}
                    </View>
                  )}
              </ScrollView>
            )}
          </Tab>

          <Tab heading={i18n.t('HBA-0700-faq')}>
            {isLoddngFaq ? <ActivityIndicator /> : (
              <ScrollView>
                {faqData.length === 0 ?
                  <Text style={styles.messageText}>{i18n.t('HBA-0700-msgNoFAQ')}</Text>
                  : (
                    <View>
                      {this.renderAccordiansFaq()}
                    </View>
                  )}
              </ScrollView>
            )}
          </Tab>
        </Tabs>
        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0200-noticeList')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}