/*
 * モジュール名 : 通知地点選択（村域）コンポーネント
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import { Container, Content, Header, Body, Item, Input, Icon, Button, Text, List, ListItem } from 'native-base';
import NetInfo from "@react-native-community/netinfo";
import Dialog from "react-native-dialog";
import i18n from 'i18n-js';
import { isEmpty } from './../common/utils';
import { ActivityIndicator } from "react-native";
import styles from '../common/style';
import appConfig from '../../app.json';

//コンポーネントの内容を定義
export default class Villages extends Component {
  constructor() {
    super()
    this.state = {
      screenId: 'HBA-0910',
      villages_data: [],
      isSetting: true,
      filtered_data: [],
      isShowErrDialog: false,       //エラーダイアログ表示フラグ
      messageBody: '',
    };
  }

  //[*] 村域一覧取得
  reqDataVillages(point, city_code, prefecture_code, region_code, noticeLang) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/appsettings";
    let param = {
      type: "village",
      lang: noticeLang //言語キー
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
      path: '/api/v1/appsettings',
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //success
        let data = responseJson['setting']['villages'];

        //地域コードを絞り込む
        let prefecture_data = data.filter(target => {
          return target.region_code == region_code;
        });

        //都道府県を絞り込む
        let city_data = prefecture_data.filter(target => {
          return target.prefecture_code == prefecture_code;
        });

        //市町村を絞り込む
        let villag_data = city_data.filter(target => {
          return target.city_code == city_code;
        });

        if (isEmpty(villag_data)) {
          //村域以下がない場合は、通知設定画面に戻る
          this.props.navigation.navigate('NoticeSetScreen',
            {
              point: point,                      //地点
              city_code: city_code,              //市町村コード 
              village_code: '',                  //村域：空白
              prefecture_code: prefecture_code,  //都道府県コード 
              region_code: region_code           //地域コード
            });
        } else {
          //村域以下データ設定
          this.setState({ villages_data: villag_data });
          this.setState({ filtered_data: city_data });
        }
      })
      .finally(() => {
        this.setState({ isSetting: false });
      });
  }

  //[*]コンポーネントのマウント
  componentDidMount() {
    //パラメータ取得
    const { point, city_code, prefecture_code, region_code, noticeLang } = this.props.route.params;

    // インターネットが接続されているかチェックする
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        //村域データ取得
        this.reqDataVillages(point, city_code, prefecture_code, region_code, noticeLang);
      }
      else {
        // 通知地点情報を取得できませんでした。
        this.showErrDialog(i18n.t('HBA-0900-digConnErr'));
      }
    });

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

  // [*] イベント処理:行選択
  handleItemClick = (code, prefecture_code, city_code, region_code) => {
    //選択地点
    const point = this.props.route.params.point;
    //通知設定画面に遷移
    this.props.navigation.navigate('NoticeSetScreen',
      {
        point: point,                      //地点
        city_code: city_code,              //市町村コード 
        village_code: code,                //村域以下コード
        prefecture_code: prefecture_code,  //都道府県コード 
        region_code: region_code           //地方コード 
      });        //村域：選択値
  }

  // [*] イベント処理:村域以下検索
  fetchData(textData) {
    const noticeLang = this.props.route.params.noticeLang;
    if (textData) {
      const dataSource = this.state.filtered_data;
      var itemData = "";
      const newData = dataSource.filter(
        function (item) {
          noticeLang === 'ja' && (itemData = item.name_ja ? item.name_ja : '')
          noticeLang === 'en' && (itemData = item.name_en ? item.name_en : '')
          noticeLang === 'zhs' && (itemData = item.name_zhs ? item.name_zhs : '')
          return itemData.indexOf(textData) > -1;
        }
      );
      if (newData.length > 0) {
        this.setState({ filtered_data: newData });
      }
    } else {
      const dataSource = this.state.villages_data;
      this.setState({ filtered_data: dataSource });
    }
  }

  //表示する要素を返す
  render() {
    const { filtered_data, isSetting, isShowErrDialog, messageBody } = this.state;
    const noticeLang = this.props.route.params.noticeLang;
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              onChangeText={this.fetchData.bind(this)}
              placeholder="Search"
            />
          </Item>
          <Button transparent>
            <Text>Search</Text>
          </Button>
        </Header>
        {isSetting ? <ActivityIndicator /> : (
          <Content>
            <List>
              {filtered_data.map((value, index) => {
                return (
                  <ListItem key={index} onPress={() => this.handleItemClick(value.code, value.prefecture_code, value.city_code, value.region_code)}>
                    <Body style={styles.body}>
                      {noticeLang === 'ja' && (
                        <Text style={styles.detailItem}>{value.name_ja}</Text>
                      )}
                      {noticeLang === 'en' && (
                        <Text style={styles.detailItem}>{value.name_en}</Text>
                      )}
                      {noticeLang === 'zhs' && (
                        <Text style={styles.detailItem}>{value.name_zhs}</Text>
                      )}
                    </Body>
                  </ListItem>
                );
              })}
            </List>
          </Content>
        )}
        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0910-pointChoice')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}