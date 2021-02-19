/*
 * モジュール名 : 手帳閲覧コンポーネント
 * 作成日 ：2020/10/04
 * 作成者 : NEC
 * 修正日 :
 * 修正者 :
 * ver:1.0.0
 */
import React from "react";
import { Dimensions, Alert, View, Text, AppState } from "react-native";
import { WebView } from "react-native-webview";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useNetInfo } from "@react-native-community/netinfo";
import { GetHandbookPDFURL, GetHandBookHostingURL } from "./../common/database";
import { isEmpty } from "./../common/utils";

// PDF.JS のリンクを参照する
export default class NoteBookWebViewScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      screenId: "HBA-0100",
      pdfURL: "",
      isConnected: true,
      isPdfURLExist: true, // PDFのURLがDBに登録してるか
      isBackground: false,
    };
  }

  // asyncストレージから言語情報を取得する
  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      NetInfo.fetch().then((state) => {
        console.log("Connection type", state.type); // Connection type wifi
        console.log("Is connected?", state.isConnected); // Is connected? true

        this.setState({ isConnected: state.isConnected });
      });

      //const netInfo = useNetInfo();
      //console.log("netInfo.isConnected.toString() :::::",netInfo.isConnected.toString());

      // タイトルを設定する 手帳閲覧
      const { setOptions } = this.props.navigation;
      setOptions({ title: i18n.t("HBA-2000-handbookView") });

      try {
        let hostingURL = await GetHandBookHostingURL();
        console.log("PDFのHosting URL : ", hostingURL);

        const handbookPDFURL = await GetHandbookPDFURL();
        let pdfURL = hostingURL + "?random=" + Math.random() + "&file=";

        console.log("handbookPDFURL : ", handbookPDFURL.success);

        // 現在選択されている言語を取得する
        const langValue = await AsyncStorage.getItem("lang");

        let pdfFileURL = ""; // 20210205 mod by oushibu

        switch (langValue) {
          case "ja":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.en.fileurl); // 日本語
            break;
          case "en":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.en.fileurl); // 英語
            break;
          case "vi":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.vn.fileurl); // ベトナム語
            break;
          case "zh":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.ch.fileurl); // 中国語
            break;
          case "ph":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.ph.fileurl); // フィリピン語
            break;
          case "id":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.id.fileurl); // インドネシア語
            break;
          case "th":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.th.fileurl); // タイ語
            break;
          case "km":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.kh.fileurl); // カンボジア語
            break;
          case "my":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.mm.fileurl); // ミャンマー語
            break;
          case "mn":
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.mn.fileurl); // モンゴル語
            break;
          default:
            pdfFileURL = encodeURIComponent(handbookPDFURL.data.en.fileurl);
        }

        // 20210205 mod by oushibu
        if (isEmpty(pdfFileURL)) {
          this.setState({ isPdfURLExist: false });
        } else {
          this.setState({ isPdfURLExist: true });
        }

        pdfURL = pdfURL + pdfFileURL + "#1";

        console.log("現在のPDFのURL ： ", pdfURL);
        // pdfURLを設定する
        this.setState({ pdfURL: pdfURL });
      } catch (e) {
        console.log(e);
        Alert.alert(
          // アラートダイアログ
          i18n.t("HBA-0100-digConnErr"),
          "",
          [
            {
              text: "OK",
              onPress: () => {
                // OKボタンを押下した際の処理
                this.props.navigation.navigate("HomeScreen"); // ホーム画面へ移動
              },
            },
          ]
        );
      }
    });

    this._unsubscribe2 = this.props.navigation.addListener("blur", async () => {
      this.setState({ isConnected: true, isPdfURLExist: true });
    });

    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    try {
      this._unsubscribe();
      this._unsubscribe2();
    } catch (e) {}
  }

  _handleAppStateChange = (nextAppState) => {
    console.log("現在Appの状態 : ", nextAppState);
    if (nextAppState === "active") {
      this.setState({ isBackground: false });
    } else if (nextAppState === "background") {
      this.setState({ isBackground: true });
    }
  };

  render() {
    if (this.state.isConnected && this.state.isPdfURLExist) {
      if (this.state.isBackground) {
        return null;
      } else {
        return (
          // WebviewにPDFを表示する
          <WebView
            source={{
              uri: this.state.pdfURL,
              method: "GET",
              headers: { "Cache-Control": "no-cache" },
            }}
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height,
            }}
            onHttpError={(syntheticEvent) => {
              // 手帳ファイルが存在しない場合の処理 : ホスティングにアクセスできない場合。
              //console.log("onHttpError::::::::::::::::::::::::");
              const { nativeEvent } = syntheticEvent;
              Alert.alert(
                // アラートダイアログ
                i18n.t("HBA-0100-digConnErr"),
                "",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // OKボタンを押下した際の処理
                      this.props.navigation.navigate("HomeScreen"); // ホーム画面へ移動
                    },
                  },
                ]
              );
            }}
            onError={(syntheticEvent) => {
              // 手帳ファイルが存在しない場合の処理 : 予想以外なエラーが発生する場合。
              //console.log("onError::::::::::::::::::::::::");
              const { nativeEvent } = syntheticEvent;
              Alert.alert(
                // アラートダイアログ
                i18n.t("HBA-0100-digConnErr"),
                "",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // OKボタンを押下した際の処理
                      this.props.navigation.navigate("HomeScreen"); // ホーム画面へ移動
                    },
                  },
                ]
              );
            }}
          />
        );
      }
    } else {
      return (
        <WebView
          originWhitelist={["*"]}
          source={{ html: "<h1>" + i18n.t("HBA-0100-digConnErr") + "</h1>" }}
          onLoad={() => {
            Alert.alert(
              // アラートダイアログ
              i18n.t("HBA-0100-digConnErr"),
              "",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // OKボタンを押下した際の処理
                    this.props.navigation.navigate("HomeScreen"); // ホーム画面へ移動
                  },
                },
              ]
            );
          }}
        />
      );
    }
  }
}
