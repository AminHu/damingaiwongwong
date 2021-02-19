/*
 * モジュール名 : 災害情報一覧コンポーネント
 * 作成日 ：2020/11/25
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Container, Header, Tab, Tabs, ScrollableTab, Right, Icon, Grid, Col, Content, List, ListItem, Text, Body } from 'native-base';
import { ActivityIndicator, TouchableOpacity } from "react-native";
import i18n from 'i18n-js';
import styles from "../common/style";
import appConfig from '../../app.json';
import Dialog from "react-native-dialog";
import NetInfo from "@react-native-community/netinfo";
import { useNetInfo } from "@react-native-community/netinfo";
import { isEmpty, SortJsonData } from './../common/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDataMunicipality, setDataPushNotice, getPushNoticeTest } from './../setting/app_setting';

//コンポーネントの内容を定義
export default class DisasterListScreen extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0300',
      noticeLang: 'ja',
      municipalityList: [],     //通知設定地点リスト
      earthquake_data: [],      //地震情報
      warning_data: [],         //気象情報
      eruption_data: [],        //噴火情報
      heatillness_data: [],     //熱中症情報
      is_earthquake: true,      //地震情報取得状態フラグ
      is_warning: true,         //気象情報取得状態フラグ
      is_eruption: true,        //噴火情報取得状態フラグ
      is_heatillness: true,     //熱中症情報取得状態フラグ
      isShowErrDialog: false,   //エラーダイアログ表示フラグ
      messageBody: '',
      warningInfoMessage: '',
      heatillnessInfoMessage: '',
      tabIndex:0,
      tabDisabled:true,
    };
  }

  //[*] 地震情報一覧データ取得
  reqDataEarthquake(lang_key) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/earthquake/list";
    let param = {
      lang: lang_key, //言語キー
      limit: appConfig.safetyTips.earthquakes.limit,   //取得数
      from: appConfig.safetyTips.earthquakes.from,     //最小震度下限  
      to: appConfig.safetyTips.earthquakes.to          //最大震度上限
    };
    let queryParameters = [];
    for (let key in param) {
      let encodedKey = encodeURIComponent(key);
      let encodedValue = encodeURIComponent(param[key]);
      queryParameters.push(encodedKey + '=' + encodedValue);
    }
    queryParameters = queryParameters.join('&');

    // HTTP基本設定
    fetch(FQDN + "?" + queryParameters, {
      protocol: 'https',
      method: 'GET',
      path: '/api/v1/earthquake/list',
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log("地震情報 : ",responseJson['earthquakes']);
        // 発表日時の逆順でデータを表示する。
        const sEarthquakesData = responseJson['earthquakes'].sort((a,b) => {return a.occurred_value < b.occurred_value;});
        this.setState({ earthquake_data: sEarthquakesData });
      })
      .catch((error) => {
        console.error(error);
        //エラーダイアログ表示
        this.showErrDialog(i18n.t('HHBA-0300-msgErrEW'));
      })
      .finally(() => {
        this.setState({ is_earthquake: false });
      });
  }

  //[*] 気象情報一覧データ取得
  async reqDatawarning(data, lang_key,pointName) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/warning";
    let formBody = {
      lang: lang_key,   //言語キー
      type: appConfig.safetyTips.ｗarnings.type          //警報種別  1:注意報以上　2:警報以上　3:特別警報のみ
    };

    const villages = {
      region_code: data.region_code,          //地方コード
      prefecture_code: data.prefecture_code,  //都道府県コード
      city_code: data.city_code,              //市区町村コード
      village_code: data.village_code         //村域以下コード
    }
    const cities = {
      region_code: data.region_code,          //地方コード
      prefecture_code: data.prefecture_code,  //都道府県コード
      city_code: data.city_code,              //市区町村コード
    }

    //村域以下有無より設定値制御
    if (isEmpty(data.village_code)) {
      formBody['municipality'] = cities;
    } else {
      formBody['municipality'] = villages;
    }

    // HTTP基本設定
    var response = await fetch(FQDN, {
      protocol: 'https',
      method: 'POST',
      body: JSON.stringify(formBody),
      path: '/api/v1/warning',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then(async (response) => response.json())
      .then(async (responseJson) => {
        let resData = responseJson['warnings'];

        //console.log("function async reqDatawarning(data, lang_key,pointName) -> pointName",pointName);

        if (isEmpty(resData)) {
          resData.push({ 'municipality_name': pointName, 'point': data.point });
        } else {
          for (let i = 0; i < resData.length; i++) {
            resData[i]['point'] = data.point; //地点番号追加
          }
        }
        return { success: true, resData };
      })
      .catch((error) => {
        console.error(error);
        return { success: false, error };
      });
    return response;
  }

  //[*] 噴火情報一覧取得
  reqDataEruption(lang_key) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/eruption/list";
    let param = {
      lang: lang_key //言語キー
    };
    let queryParameters = [];
    for (let key in param) {
      let encodedKey = encodeURIComponent(key);
      let encodedValue = encodeURIComponent(param[key]);
      queryParameters.push(encodedKey + '=' + encodedValue);
    }
    queryParameters = queryParameters.join('&');

    // HTTP基本設定
    fetch(FQDN + "?" + queryParameters, {
      protocol: 'https',
      method: 'GET',
      path: '/api/v1/eruption/list',
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log("噴火一覧情報 : ",responseJson['eruptions']);
        // 発表日時の逆順で表示する。
        const sEruptionData = responseJson['eruptions'].sort((a,b) => {return a.occurred_value < b.occurred_value;});
        this.setState({ eruption_data: sEruptionData });
      })
      .catch((error) => {
        console.error(error);
        //エラーダイアログ表示
        this.showErrDialog(i18n.t('HBA-0300-msgErrVW'));
      })
      .finally(() => {
        this.setState({ is_eruption: false });
      });

  }

  //[*] 熱中症情報一覧データ取得
  async reqDataheatillness(data, lang_key) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/heatillness";

    let formBody = {
      lang: lang_key   //言語キー
    };

    const villages = {
      region_code: data.region_code,          //地方コード
      prefecture_code: data.prefecture_code,  //都道府県コード
      city_code: data.city_code,              //市区町村コード
      village_code: data.village_code         //村域以下コード
    }
    const cities = {
      region_code: data.region_code,          //地方コード
      prefecture_code: data.prefecture_code,  //都道府県コード
      city_code: data.city_code,              //市区町村コード
    }

    //村域以下有無より設定値制御
    if (isEmpty(data.village_code)) {
      formBody['municipality'] = cities;
    } else {
      formBody['municipality'] = villages;
    }

    // HTTP基本設定
    var response = await fetch(FQDN, {
      protocol: 'https',
      method: 'POST',
      body: JSON.stringify(formBody),
      path: '/api/v1/heatillness',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        var resData = responseJson['heatillness'];
        resData['point'] = data.point; //地点番号追加
        return { success: true, resData };
      })
      .catch((error) => {
        console.error(error);
        return { success: false, error };
      });

    return response;
  }

  //[*]通知地点情報取得  
  async getDataMunicipality(lang_key) {
    //通知地点取得
    const municipalityInfo = JSON.parse(await AsyncStorage.getItem('noticePoint'));

    //console.log("気象情報　－＞　通知地点取得　:　",municipalityInfo);

    if (!isEmpty(municipalityInfo)) {
      let resHeatillness = [];
      let resWarning = [];

      municipalityInfo.map(async (data) => {

        //console.log("気象情報　－＞　通知地点取得 ->  地点　:　",data," 言語キー : ",lang_key);
        const pointName = await getDataMunicipality(lang_key, data);
        //console.log("pointName :::::::::::::::::::::",pointName);

        //気象情報一覧データ取得
        await this.reqDatawarning(data, lang_key,pointName).then((res) => {
          if (res.success) {
            resWarning = resWarning.concat(res.resData);
            //console.log("気象情報 : ",resWarning);
          } else {
            //エラーダイアログ表示
            this.showErrDialog(i18n.t('HBA-0300-msgErrWW'));    //気象警報／注意報を取得できませんでした。
          }
        }).finally(() => {
          resWarning = SortJsonData(resWarning, "point", false);
          this.setState({ warning_data: resWarning });
          this.setState({ is_warning: false });
          if (isEmpty(resWarning)) {
            this.setState({ warningErrMessage: i18n.t('HBA-0300-msgNoWW') });   //気象警報／注意報はありません。
          }
        });

        //熱中症情報一覧取得  
        this.reqDataheatillness(data, lang_key)
          .then((res) => {
            if (res.success) {
              resHeatillness.push(res.resData);
            } else {
              //エラーダイアログ表示
              this.showErrDialog(i18n.t('HBA-0300-msgErrHW'));//熱中症情報を取得できませんでした。
            }
          }).finally(() => {
            resHeatillness = SortJsonData(resHeatillness, "point", false);
            this.setState({ heatillness_data: resHeatillness });
            this.setState({ is_heatillness: false });
            if (isEmpty(resHeatillness)) {
              this.setState({ heatillnessInfoMessage: i18n.t('HBA-0300-msgNoHW') });//熱中症情報はありません。",
            }
          });
      })
    } else {
      //気象情報一覧初期化
      this.setState({ warning_data: [] });
      this.setState({ is_warning: false });
      this.setState({ warningInfoMessage: i18n.t('HBA-0300-msgNoWW') });      // 気象警報／注意報はありません。

      //熱中症情報一覧初期化
      this.setState({ heatillness_data: [] });
      this.setState({ is_heatillness: false });
      this.setState({ heatillnessInfoMessage: i18n.t('HBA-0300-msgNoHW') });  // 熱中症情報はありません。
    }
  }

  //[*]コンポーネントのマウント
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      // タイトルを設定する  災害情報一覧
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t('HBA-0300-disasterList') });

      // 遷移元を保存する
      await AsyncStorage.setItem('BlurFromDisaster','Yes');

      // 自動戻りフラグを「No」に設定する
      await AsyncStorage.setItem('AutoReturnForDisaster','No');        // For 災害情報

      //通知言語情報取得
      const lang_key = await AsyncStorage.getItem('noticeLang');
      //console.log("地震情報 : ",this.state.is_earthquake,"  気象情報 : ",this.state.is_warning,"  噴火情報 : ",this.state.is_eruption,"  熱中症情報 : ",this.state.is_heatillness);
      //this.setState({ noticeLang: lang_key,tabIndex:1});
      this.setState({ noticeLang: lang_key});

      // インターネットが接続されているか確認する必要
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          //console.log("Net Is OK -> Connection type : ", state.type);      // Connection type wifi
          //console.log("Net Is OK -> Is connected?   : ", state.isConnected); // Is connected? true

          //地震一覧取得
          this.reqDataEarthquake(lang_key);

          // 通知地点情報取得
          this.getDataMunicipality(lang_key);

          //噴火情報一覧取得
          this.reqDataEruption(lang_key);
        }
        else {
          //console.log("Net Is No OK -> Connection type : ", state.type);      // Connection type wifi
          //console.log("Net Is No OK -> Is connected?   : ", state.isConnected); // Is connected? true

          // エラーダイアログ表示 ->  災害情報を取得できませんでした。
          this.showErrDialog(i18n.t('HBA-0300-digConnErr'));
        }
      });

    });

    // this._unsubscribe2 = this.props.navigation.addListener('blur', async () => {
    //   //「地震情報」をデフォルトとして表示する。
    //   setTimeout(this._tabs.goToPage.bind(this._tabs,0));
    // });
    
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

  //[*] イベント処理:地震詳細
  handleEarthquakesClick = (item) => {
    //地震詳細画面へ遷移
    this.props.navigation.navigate("DisasterDetailScreen", { tab: 1, code: item, noticeLang: this.state.noticeLang })
  }

  //[*] イベント処理:噴火詳細
  handleEruptionClick = (item) => {
    //噴火詳細画面へ遷移
    this.props.navigation.navigate("DisasterDetailScreen", { tab: 3, code: item, noticeLang: this.state.noticeLang })
  }

  //[*] 地震情報表示
  dispEarthquakeDetail(value) {
    if (this.state.noticeLang === 'ja') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.epicenter_ja}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{i18n.t('HBA-0300-earthquakeMax')}：{value.max_ja}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'en') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.epicenter_en}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{i18n.t('HBA-0300-earthquakeMax')}：{value.max_en}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'zhs') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.epicenter_zhs}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{i18n.t('HBA-0300-earthquakeMax')}：{value.max_zhs}</Text>
        </>
      );
    }
  }

  //[*] 気象情報表示
  dispWarning(value) {
    //console.log("this.state.noticeLang :::::: ",this.state.noticeLang);

    if (this.state.noticeLang === 'ja') {
      if (isEmpty(value.warning_name_ja)) {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name}</Text>
            <Text style={styles.listItemKey}>{i18n.t('HBA-0300-msgNoWW')}</Text>
          </>
        );
      } else {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name_ja}</Text>
            <Text style={styles.listItemKey}>{value.warning_name_ja}</Text>
          </>
        );
      }
    }
    if (this.state.noticeLang === 'en') {
      if (isEmpty(value.warning_name_en)) {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name}</Text>
            <Text style={styles.listItemKey}>{i18n.t('HBA-0300-msgNoWW')}</Text>
          </>
        );
      } else {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name_en}</Text>
            <Text style={styles.listItemKey}>{value.warning_name_en}</Text>
          </>
        );
      }
    }
    if (this.state.noticeLang === 'zhs') {
      if (isEmpty(value.warning_name_zhs)) {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name}</Text>
            <Text style={styles.listItemKey}>{i18n.t('HBA-0300-msgNoWW')}</Text>
          </>
        );
      } else {
        return (
          <>
            <Text style={styles.listItemKey}>{value.municipality_name_zhs}</Text>
            <Text style={styles.listItemKey}>{value.warning_name_zhs}</Text>
          </>
        );
      }
    }
  }

  //[*] 噴火情報表示
  dispEruption(value) {
    if (this.state.noticeLang === 'ja') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.volcano_name_ja}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{value.type_ja}</Text>
          <Text style={styles.listItemKey}>{value.level_ja}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'en') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.volcano_name_en}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{value.type_en}</Text>
          <Text style={styles.listItemKey}>{value.level_en}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'zhs') {
      return (
        <>
          <Text style={{ color: '#F00' }}>{value.volcano_name_zhs}</Text>
          <Text style={styles.listItemKey}>{value.occurred_value}</Text>
          <Text style={styles.listItemKey}>{value.type_zhs}</Text>
          <Text style={styles.listItemKey}>{value.level_zhs}</Text>
        </>
      );
    }
  }

  //[*] 熱中症情報表示
  dispHeatillness(value) {
    if (this.state.noticeLang === 'ja') {
      return (
        <>
          <Text style={styles.listItemKey}>{value.municipality_ja}</Text>
          <Text style={styles.listItemKey}>{value.heat_index_ja}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'en') {
      return (
        <>
          <Text style={styles.listItemKey}>{value.municipality_en}</Text>
          <Text style={styles.listItemKey}>{value.heat_index_en}</Text>
        </>
      );
    }
    if (this.state.noticeLang === 'zhs') {
      return (
        <>
          <Text style={styles.listItemKey}>{value.municipality_zhs}</Text>
          <Text style={styles.listItemKey}>{value.heat_index_zhs}</Text>
        </>
      );
    }
  }

  //[*] 暑さ指数表示
  dispHeatIndex(code) {
    const heat_index_value = [
      { code: -1, name: i18n.t('HBA-0300-index0') },  //未発表
      { code: 1, name: i18n.t('HBA-0300-index1') },   //注意
      { code: 2, name: i18n.t('HBA-0300-index2') },   //警戒
      { code: 3, name: i18n.t('HBA-0300-index3') },   //厳重警戒
      { code: 4, name: i18n.t('HBA-0300-index4') }];  //危険

    const filtered = heat_index_value.filter(target => {
      return target.code === code;
    });

    return filtered.map((value, index) =>
      <Text key={index} style={{ fontSize: 12, backgroundColor: this.colorSwitch(value.code), alignSelf: 'flex-start' }} >
        {value.name}
      </Text >)
  }

  // 背景色表示
  colorSwitch(param) {
    var bgcolor = "";
    switch (param) {
      case 1: //'注意'
        bgcolor = "#87CEEB";
        break;
      case 2: //'警戒'
        bgcolor = "#FFFF00";
        break;
      case 3: //'厳重注意'
        bgcolor = "#FFA500";
        break;
      case 4: //'危険'
        bgcolor = "#FF0000";
        break;
      default:
        bgcolor = "white";
    }
    return bgcolor;
  }

  //表示する要素を返す
  render() {
    const { earthquake_data, warning_data, eruption_data, heatillness_data,
      is_earthquake, is_warning, is_eruption, is_heatillness, isShowErrDialog, messageBody, warningInfoMessage, heatillnessInfoMessage } = this.state;

    return (
      <Container>
        <Header hasTabs style={styles.headerTab} />
        <Tabs renderTabBar={() => <ScrollableTab />} ref={component => this._tabs = component}>

          {/* 地震情報*/}
          <Tab heading={i18n.t('HBA-0300-earthquakeInfo')}>
            {is_earthquake ? <ActivityIndicator /> : (
              <Container>
                <Content>
                  {isEmpty(earthquake_data) ?
                    <Text style={styles.messageText}>{i18n.t('HBA-0300-msgNoEW')}</Text>
                    : (
                      <List>
                        { earthquake_data.map((value, index) => {
                          return (
                            <ListItem key={index}>
                              <Grid>
                                <Col>
                                  <TouchableOpacity
                                    onPress={() => this.handleEarthquakesClick(value.code)}
                                  >
                                    <Body>
                                      {this.dispEarthquakeDetail(value)}
                                    </Body>
                                  </TouchableOpacity>
                                </Col>
                                <Col style={styles.detailItemCol}>
                                  <TouchableOpacity
                                    onPress={() => this.handleEarthquakesClick(value.code)}
                                  >
                                    <Right>
                                      <Icon name="chevron-right" type="Octicons" style={{ color: 'gray' }}></Icon>
                                    </Right>
                                  </TouchableOpacity>
                                </Col>
                              </Grid>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              </Container>
            )}
          </Tab>

          {/* 気象情報*/}
          <Tab heading={i18n.t('HBA-0300-weatherInfo')}>
            {is_warning ? <ActivityIndicator /> : (
              <Container>
                <Content>
                  {isEmpty(warning_data) ?
                    <Text style={styles.messageText}>{warningInfoMessage}</Text>
                    : (
                      <List>
                        {warning_data.map((value, index) => {
                          return (
                            <ListItem key={index}>
                              <Body>
                                <Text style={{ color: '#F00' }}>{i18n.t('HBA-0300-point')}：{value.point}</Text>
                                {this.dispWarning(value)}
                              </Body>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              </Container>
            )}
          </Tab>

          {/* 噴火情報*/}
          <Tab heading={i18n.t('HBA-0300-eruptionInfo')}>
            {is_eruption ? <ActivityIndicator /> : (
              <Container>
                <Content>
                  {isEmpty(eruption_data) ?
                    <Text style={styles.messageText}>{i18n.t('HBA-0300-msgNoVW')}</Text>
                    : (
                      <List>
                        {eruption_data.map((value, index) => {
                          return (
                            <ListItem key={index}>
                              <Grid>
                                <Col>
                                  <TouchableOpacity
                                    onPress={() => this.handleEruptionClick(value.volcano_code)}
                                  >
                                    <Body>
                                      {this.dispEruption(value)}
                                    </Body>
                                  </TouchableOpacity>
                                </Col>
                                <Col style={styles.detailItemCol}>
                                  <TouchableOpacity
                                    onPress={() => this.handleEruptionClick(value.volcano_code)}
                                  >
                                    <Right>
                                      <Icon name="chevron-right" type="Octicons" style={{ color: 'gray' }}></Icon>
                                    </Right>
                                  </TouchableOpacity>
                                </Col>
                              </Grid>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              </Container>
            )}
          </Tab>

          {/* 熱中症情*/}
          <Tab heading={i18n.t('HBA-0300-heatstrokeInfo')}>
            {is_heatillness ? <ActivityIndicator /> : (
              <Container>
                <Content>
                  {isEmpty(heatillness_data) ?
                    <Text style={styles.messageText}>{heatillnessInfoMessage}</Text>
                    : (
                      <List>
                        {heatillness_data.map((value, index) => {
                          return (
                            <ListItem key={index}>
                              <Body>
                                <Text style={{ color: '#F00' }}>{i18n.t('HBA-0300-point')}：{value.point}</Text>
                                {this.dispHeatillness(value)}
                                {this.dispHeatIndex(value.heat_index_value)}
                              </Body>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                </Content>
              </Container>
            )}
          </Tab>
        </Tabs>

        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0300-disasterList')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>

      </Container>
    );
  }
}
