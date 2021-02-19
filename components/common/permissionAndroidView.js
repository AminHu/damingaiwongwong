/*
 * モジュール名 : 初回起動する時、各権限(通知とロケーションなど)をリクエストする
 * 作成日 ：2020/11/20
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Platform
} from 'react-native';
import * as Permissions from 'expo-permissions';

export default class PermissionAndroidViewScreen extends Component {
  constructor() {
    super();
  }

  async requestPermissions() {
    try { 
      // アンドロイドの場合
      if (Platform.OS === 'android') {
        await this.requestLocationPermission();
      }
      // IOSの場合
      else {
        await this.requestNotificationPermission();
        await this.requestLocationPermission();
      }
    } catch (err) {
    }
    await this.props.navigation.navigate("HomeScreen");  
  }

  // 通知権限をリクエストする
  async requestNotificationPermission() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
  }
  
  // 位置情報権限をリクエストする
  async requestLocationPermission() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
    }
  }

  // カメラ利用権限をリクエストする
  async requestCameraPermission() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.CAMERA);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
    }
  }
  
  async componentDidMount() {
    await this.requestPermissions();
  }

  render() {
    return (
      <View>
        <Text></Text> 
      </View>
    )
  }
}
