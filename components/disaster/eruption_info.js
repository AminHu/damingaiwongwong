/*
 * モジュール名 : 噴火情報詳細コンポーネント
 * 作成日 ：2020/12/03
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import styles from '../common/style';
import { Container, List, ListItem, Text, Item, View, Label } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { useNetInfo } from "@react-native-community/netinfo";
import { ActivityIndicator } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import i18n from 'i18n-js';
import appConfig from '../../app.json';
import Dialog from "react-native-dialog";

//コンポーネントの内容を定義
export default class EruptionInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      screenId: 'HBA-0310',
      eruption_detail: [],      //噴火詳細情報
      isLoadingDetail: true,    //噴火詳細情報取得状態フラグ
      isShowErrDialog: false,   //エラーダイアログ表示フラグ
      messageBody: '',
    };
  }

  //[*] コンポーネントのマウント
  async componentDidMount() {
    // インターネットが接続されているか確認する必要
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //console.log("Net Is OK -> Connection type : ", state.type);      // Connection type wifi
        //console.log("Net Is OK -> Is connected?   : ", state.isConnected); // Is connected? true

        //火山コードを受け取る
        const volcanoCode = this.props.volcanoCode;
        //通知言語を受け取る
        const noticeLang = this.props.lang;
        //噴火詳細データ取得
        this.getDataEruptionDetail(volcanoCode, noticeLang);
      }
      else {
        //console.log("Net Is No OK -> Connection type : ", state.type);      // Connection type wifi
        //console.log("Net Is No OK -> Is connected?   : ", state.isConnected); // Is connected? true

        // エラーダイアログ表示 ->  "HBA-0300-msgErrVW": "噴火情報を取得できませんでした。",
        this.showErrDialog(i18n.t('HBA-0300-msgErrVW'));
      }
    });
  }

  //[*] イベント処理:噴火詳細データ取得
  getDataEruptionDetail(volcanoCode, noticeLang) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/eruption/detail/" + volcanoCode;
    let param = {
      lang: noticeLang  //言語キー
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
      path: '/api/v1/eruption/detail/' + volcanoCode,
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //success
        this.setState({ eruption_detail: responseJson['eruption_detail'] });
      })
      .catch((error) => {
        console.error(error);
        //エラーダイアログ表示  "HBA-0300-msgErrVW": "噴火情報を取得できませんでした。",
        this.showErrDialog(i18n.t('HBA-0300-msgErrVW'));
      })
      .finally(() => {
        this.setState({ isLoadingDetail: false });
      });
  }

  //[*]エラーダイアログ表示
  showErrDialog(message) {
    this.setState({ isShowErrDialog: true });
    this.setState({ messageBody: message });
  }
  handleError() {
    this.setState({ isShowErrDialog: false });
    //TOPメニューに遷移
    this.props.navigation.navigate('HomeScreen');
  }

  //[*]火山名表示
  dispVolcanoName(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.volcano_name_title_ja}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.volcano_name_value_ja}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.volcano_name_title_en}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.volcano_name_value_en}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.volcano_name_title_zhs}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.volcano_name_value_zhs}</Text>
          </View>
        </>
      );
    }
  }

  //[*]警報種別表示
  dispTypeTitle(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.type_title_ja}：</Label>
          <Text style={styles.itemText}>{value.type_value_ja}</Text>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.type_title_en}：</Label>
          <Text style={styles.itemText}>{value.type_value_en}</Text>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.type_title_zhs}：</Label>
          <Text style={styles.itemText}>{value.type_value_zhs}</Text>
        </>
      );
    }
  }

  //[*]レベル表示
  dispLevel(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.level_title_ja}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.level_text_ja}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.level_title_en}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.level_text_en}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.level_title_zhs}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.level_text_zhs}</Text>
          </View>
        </>
      );
    }
  }

  //[*]マグニチュード表示
  dispOccurredTitle(value) {
    if (this.props.lang === 'ja') {
      return (
        <Label style={styles.itemLabel}>{value.occurred_title_ja}：</Label>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <Label style={styles.itemLabel}>{value.occurred_title_en}：</Label>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <Label style={styles.itemLabel}>{value.occurred_title_zhs}：</Label>
      );
    }
  }

  //表示する要素を返す
  render() {
    const { eruption_detail, isLoadingDetail, isShowErrDialog, messageBody } = this.state;
    return (
      <Container >
        <View style={styles.titleView}>
          <ListItem noBorder >
            <Text>{i18n.t('HBA-0300-eruptionInfo')}</Text>
          </ListItem>
        </View>
        {isLoadingDetail ? <ActivityIndicator /> : (
          <List>
            <Item>
              {/* 火山名 */}
              {this.dispVolcanoName(eruption_detail)}
            </Item>
            <Item>
              {/* 警報種別 */}
              {this.dispTypeTitle(eruption_detail)}
            </Item>
            <Item  >
              {/* レベル*/}
              {this.dispLevel(eruption_detail)}
            </Item>
            <Item>
              {/* 発表日時 */}
              {this.dispOccurredTitle(eruption_detail)}
              <Text style={styles.itemText}>{eruption_detail.occurred_value}</Text>
            </Item>
          </List>
        )}
        {isLoadingDetail ? <ActivityIndicator /> : (
          <MapView
            style={styles.mapContainer}
            initialRegion={{
              latitude: eruption_detail.volcano_latitude,      //緯度
              longitude: eruption_detail.volcano_longitude,    //経度
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              draggable
              coordinate={{
                latitude: eruption_detail.volcano_latitude,
                longitude: eruption_detail.volcano_longitude,
              }}
            />
          </MapView>
        )}

        <Dialog.Container visible={isShowErrDialog}>
          <Dialog.Title>{i18n.t('HBA-0310-disasterDetails')}</Dialog.Title>
          <Dialog.Description>{messageBody}</Dialog.Description>
          <Dialog.Button label="OK" bold={true} onPress={() => this.handleError()} />
        </Dialog.Container>
      </Container>
    );
  }
}