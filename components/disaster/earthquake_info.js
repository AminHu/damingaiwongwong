/*
 * モジュール名 : 地震情報詳細コンポーネント
 * 作成日 ：2020/12/02
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React, { Component } from 'react';
import styles from '../common/style';
import { Container, List, ListItem, Text, Item, View, Label } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import NetInfo from "@react-native-community/netinfo";
import { useNetInfo } from "@react-native-community/netinfo";
import i18n from 'i18n-js';
import appConfig from '../../app.json';
import Dialog from "react-native-dialog";

//コンポーネントの内容を定義
export default class EarthquakeInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      earthquake_detail: [],    //地震詳細情報
      map_epicenter: [],        //震源地地図情報
      map_intensities: [],      //津波地図情報
      isLoadingDetail: true,    //地震詳細取得状態フラグ
      isLoadingMap: true,       //地図取得状態フラグ
      isShowErrDialog: false,   //エラーダイアログ表示フラグ
      messageBody: '',
    };
  }

  //[*] コンポーネントのマウント
  componentDidMount() {
    // インターネットが接続されているか確認する必要
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //console.log("Net Is OK -> Connection type : ", state.type);      // Connection type wifi
        //console.log("Net Is OK -> Is connected?   : ", state.isConnected); // Is connected? true

        //地震コードを受け取る
        const quakeCode = this.props.quakeCode;
        //通知言語を受け取る
        const noticeLang = this.props.lang;
        //地震情報を取得
        this.getDataEarthquakeDetail(quakeCode, noticeLang);
        //地図情報を取得
        this.getDataEarthquakeMaps(quakeCode,);
      }
      else {
        //console.log("Net Is No OK -> Connection type : ", state.type);      // Connection type wifi
        //console.log("Net Is No OK -> Is connected?   : ", state.isConnected); // Is connected? true

        // エラーダイアログ表示 ->  災害詳細情報を取得できませんでした。
        this.showErrDialog(i18n.t('HBA-0310-msgErrDisaster'));
      }
    });

  }

  //[*] 地震詳細情報取得
  getDataEarthquakeDetail(quakeCode, noticeLang) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/earthquake/detail/" + quakeCode;
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
      path: '/api/v1/earthquake/detail/' + quakeCode,
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ earthquake_detail: responseJson['earthquake_detail'] });
      })
      .catch((error) => {
        console.error(error);
        //エラーダイアログ表示
        this.showErrDialog(i18n.t('HBA-0310-msgErrDisaster'));
      })
      .finally(() => {
        this.setState({ isLoadingDetail: false });
      });
  }

  //[*] 震源地地図データ取得
  getDataEarthquakeMaps(quakeCode) {
    //URL設定
    const FQDN = "https://safetytips-cloud.com/api/v1/earthquake/map/" + quakeCode;

    // HTTP基本設定
    fetch(FQDN, {
      protocol: 'https',
      method: 'GET',
      path: '/api/v1/earthquake/map/' + quakeCode,
      headers: {
        Accept: 'application/json',
        'x-api-key': appConfig.safetyTips.APIKey
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ map_epicenter: responseJson['epicenter'] });
        this.setState({ map_intensities: responseJson['intensities'] });
      })
      .catch((error) => {
        console.error(error);
        //エラーダイアログ表示
        this.showErrDialog(i18n.t('HBA-0310-msgErrMap'));
      })
      .finally(() => {
        this.setState({ isLoadingMap: false });
      });
  }

  //[*] 各地の震度地図データ取得
  intensitiesMaps() {
    return this.state.map_intensities.map((value, index) => <Marker
      key={index}
      coordinate={{
        latitude: value.lat,
        longitude: value.lon
      }}
      title={value.intensity}
    >
    </Marker >)
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

  //[*]震源地名表示
  dispEpicenter(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.epicenter_title_ja}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.epicenter_value_ja}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.epicenter_title_en}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.epicenter_value_en}</Text>
          </View>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.epicenter_title_zhs}：</Label>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{value.epicenter_value_zhs}</Text>
          </View>
        </>
      );
    }
  }

  //[*]発生日時表示
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

  //[*]最大震度表示
  dispMax(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.max_title_ja}：</Label>
          <Text style={styles.itemText}>{value.max_value_ja}</Text>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.max_title_en}：</Label>
          <Text style={styles.itemText}>{value.max_value_en}</Text>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.max_title_zhs}：</Label>
          <Text style={styles.itemText}>{value.max_value_zhs}</Text>
        </>
      );
    }
  }

  //[*]マグニチュード表示
  dispMagnitude(value) {
    if (this.props.lang === 'ja') {
      return (
        <Label style={styles.itemLabel}>{value.magnitude_title_ja}：</Label>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <Label style={styles.itemLabel}>{value.magnitude_title_en}：</Label>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <Label style={styles.itemLabel}>{value.magnitude_title_zhs}：</Label>
      );
    }
  }

  //[*]震源の深さ表示
  dispDepth(value) {
    if (this.props.lang === 'ja') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.depth_title_ja}：</Label>
          <Text style={styles.itemText}>{value.depth_value_ja}</Text>
        </>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.depth_title_en}：</Label>
          <Text style={styles.itemText}>{value.depth_value_en}</Text>
        </>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <>
          <Label style={styles.itemLabel}>{value.depth_title_zhs}：</Label>
          <Text style={styles.itemText}>{value.depth_value_zhs}</Text>
        </>
      );
    }
  }

  //[*]津波警報/注意報メッセージ
  dispTsunami(value) {
    if (this.props.lang === 'ja') {
      return (
        <Text style={styles.itemText}>{value.tsunami_message_ja}</Text>
      );
    }
    if (this.props.lang === 'en') {
      return (
        <Text style={styles.itemText}>{value.tsunami_message_en}</Text>
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        <Text style={styles.itemText}>{value.tsunami_message_zhs}</Text>
      );
    }
  }

  //[*]震源地タイトル地図表示
  dispEpicenterTitle(value) {
    if (this.props.lang === 'ja') {
      return (
        value.epicenter_title_ja
      );
    }
    if (this.props.lang === 'en') {
      return (
        value.epicenter_title_en
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        value.epicenter_title_zhs
      );
    }
  }

  //[*]震源地値地図表示
  dispEpicenterValue(value) {
    if (this.props.lang === 'ja') {
      return (
        value.epicenter_value_ja
      );
    }
    if (this.props.lang === 'en') {
      return (
        value.epicenter_value_en
      );
    }
    if (this.props.lang === 'zhs') {
      return (
        value.epicenter_value_zhs
      );
    }
  }

  //表示する要素を返す
  render() {
    const { earthquake_detail, map_epicenter, isLoadingDetail, isLoadingMap, isShowErrDialog, messageBody } = this.state;

    return (
      <Container>
        <View style={styles.titleView}>
          <ListItem noBorder >
            <Text>{i18n.t('HBA-0300-earthquakeInfo')}</Text>
          </ListItem>
        </View>
        {isLoadingDetail ? <ActivityIndicator /> : (
          <List>
            <Item>
              {/* 震央地名 */}
              {this.dispEpicenter(earthquake_detail)}
            </Item>
            <Item>
              {/* 発生日時 */}
              {this.dispOccurredTitle(earthquake_detail)}
              <Text style={styles.itemText}>{earthquake_detail.occurred_value}</Text>
            </Item>
            <Item>
              {/* 最大震度 */}
              {this.dispMax(earthquake_detail)}
            </Item>
            <Item>
              {/* マグニチュード */}
              {this.dispMagnitude(earthquake_detail)}
              <Text style={styles.itemText}>{earthquake_detail.magnitude_value}</Text>
            </Item>
            <Item>
              {/* 震源の深さ */}
              {this.dispDepth(earthquake_detail)}
            </Item>
            <View>
              {/* 津波警報/注意報メッセージ */}
              {this.dispTsunami(earthquake_detail)}
            </View>
          </List>
        )}

        {isLoadingMap ? <ActivityIndicator /> : (
          <MapView
            style={styles.mapContainer}
            initialRegion={{
              latitude: map_epicenter.lat,     //緯度
              longitude: map_epicenter.lon,    //経度
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* 震源地 */}
            <Marker
              draggable
              coordinate={{
                latitude: map_epicenter.lat,
                longitude: map_epicenter.lon,
              }}
              title={this.dispEpicenterTitle(earthquake_detail)}
              description={this.dispEpicenterValue(earthquake_detail)}
            />
            {/* 各地の震度 */}
            {this.intensitiesMaps()}
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