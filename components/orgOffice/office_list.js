/*
 * モジュール名 : 事務所一覧コンポーネント
 * 作成日 ：2020/11/27
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from "react";
import { Linking, TouchableOpacity, ActivityIndicator } from "react-native";
import { Container, Content, List, ListItem, Text, Header, Tab, Tabs, ScrollableTab, Body } from 'native-base';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js';
import styles from "../common/style";
import { GetOfficeData, GetEmbassyData } from './../common/database';
import { isEmpty } from '../common/utils';
import Dialog from "react-native-dialog";

//コンポーネントの内容を定義
export default class OfficeScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0400',
      officeData: [],           // 事務所データ
      embassyData: [],          // 大使館データ
      isShowErrDialog: false,   //エラーダイアログ表示フラグ
      messageBody: '',
      isLoddngOffice: true,
      isLoddngEmbassy: true,
      currentTab: 0,
    };
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      //console.log("事務所一覧 -> 選択されているTab : ",this.state.currentTab);

      // タイトルを設定する 事務所一覧
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0400-officeList') });

      // 自動戻りフラグを「No」にする
      await AsyncStorage.setItem('AutoReturnForOffice', 'No');

      let sAction = "";
      // 事務所詳細画面 -> 事務所一覧画面に遷移する場合、一覧画面の内容は更新しない
      if (!isEmpty(this.props.route.params)) {
        console.log("this.props.route.params : ", this.props.route.params);
        // 画面動作
        //const {Action} = this.props.route.params;
        sAction = this.props.route.params.Action;
        this.props.route.params = null;
      }

      // インターネットが接続されているかチェックする
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {

          // 事務所詳細画面 -> 事務所一覧画面に遷移する場合、一覧画面の内容は更新しない
          if (sAction != "ReturnOfficeList") {

            // 事務所データを取得する
            const officeDatas = await GetOfficeData();
            if (officeDatas.success) {
              if (!isEmpty(officeDatas.data)) {
                this.setState({ officeData: officeDatas.data });
              } else {
                this.setState({ officeData: [] });
              }
              //データ取得完了
              this.setState({ isLoddngOffice: false });
            }
            else {
              //エラーダイアログ表示
              this.showErrDialog(i18n.t('HBA-0400-msgErrOfficeInfo'));
            }

            // 大使館データを取得する
            const embassyDatas = await GetEmbassyData();
            if (embassyDatas.success) {
              if (!isEmpty(embassyDatas.data)) {
                this.setState({ embassyData: embassyDatas.data });
              } else {
                this.setState({ embassyData: [] });
              }
              //データ取得完了
              this.setState({ isLoddngEmbassy: false });
            }
            else {
              //エラーダイアログ表示
              this.showErrDialog(i18n.t('HBA-0400-msgErrEmbassy'));
            }
          }

        }
        else {
          this.setState({ officeData: [], embassyData: [] });
          //エラーダイアログ表示
          if (this.state.currentTab == 0) {
            this.showErrDialog(i18n.t('HBA-0400-msgErrOfficeInfo'));
          }
          else {
            this.showErrDialog(i18n.t('HBA-0400-msgErrEmbassy'));
          }
        }
      });
    });

    this._unsubscribe2 = this.props.navigation.addListener('blur', async () => {
      //console.log("ヘルプ画面からトップ画面に遷移する>>>>>>>>>>>>>>>>>>>>>>>>");

      //「事務所」をデフォルトとして表示する。
      setTimeout(this._tabs.goToPage.bind(this._tabs,0));
    });

  }

  //[*]コンポーネントのアンマウント
  async componentWillUnmount() {
    this._unsubscribe();
    this._unsubscribe2();
  }

  // [*] 事務所明細クリックイベント
  handleItemClick = (item) => {
    this.props.navigation.navigate('ShowMap', item);
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

  // Tabを変更する
  changeTab(tabIndex) {
    console.log("選択されているTab : ", tabIndex);
    this.setState({ currentTab: tabIndex })
  }

  //表示する要素を返す
  render() {
    const { officeData, embassyData, isShowErrDialog, messageBody, isLoddngOffice, isLoddngEmbassy } = this.state;

    return (
      <Container>
        <Header hasTabs style={styles.headerTab} />
        <Tabs renderTabBar={() => <ScrollableTab />} style={styles.tabStyle} onChangeTab={({ i }) => { this.changeTab(i); }} ref={component => this._tabs = component}>
          {/* 事業所 */}
          <Tab heading={i18n.t('HBA-0400-office')}>
            <Container>
              {isLoddngOffice ? <ActivityIndicator /> : (
                <Content>
                  {officeData.length === 0 ?
                    <Text style={styles.messageText}>{i18n.t('HBA-0400-msgNoOfficeInfo')}</Text>
                    : (
                      <List>
                        {officeData.map((value, index) => {
                          return (
                            <ListItem avatar style={{ margin: 0 }} key={index}>
                              <TouchableOpacity style={{ flex: 1 }}
                                onPress={() => this.handleItemClick(value)}
                              >
                                <Body style={{ marginLeft: 0 }}>
                                  <Text style={styles.listTitleFont}>{value.officeName}</Text>
                                  <Text style={styles.listItemKey}>{value.address}</Text>
                                </Body>
                              </TouchableOpacity>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              )}
            </Container>
          </Tab>

          {/* 大使館 */}
          <Tab heading={i18n.t('HBA-0400-embassy')}>
            <Container>
              {isLoddngEmbassy ? <ActivityIndicator /> : (
                <Content>
                  {embassyData.length === 0 ?
                    <Text style={styles.messageText}>{i18n.t('HBA-0400-msgNoEmbassy')}</Text>
                    : (
                      <List>
                        {embassyData.map((value, index) => {
                          return (
                            <ListItem avatar style={{ margin: 0 }} key={index}>
                              <TouchableOpacity style={{ flex: 1 }}
                                onPress={() => Linking.openURL(value.embassyURL)}
                              >
                                <Body style={{ marginLeft: 0 }}>
                                  <Text style={styles.listTitleFont}>{value.embassyName}</Text>
                                  <Text style={styles.listItemKey}>{value.embassyURL}</Text>
                                </Body>
                              </TouchableOpacity>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              )}
            </Container>
          </Tab>
        </Tabs>
        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0400-officeList')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}