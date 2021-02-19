import React, { Component } from 'react';
import { Linking, View, TouchableOpacity, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { StackActions, NavigationActions } from 'react-navigation';

export default class QuestionnaireAnswerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url : this.props.route.params.url
        }
    }
    render() {
        const uri = this.state.url;
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <WebView
                    ref={(ref) => { this.webview = ref; }}
                    source={{ uri }}
                    onNavigationStateChange={(event) => {
                        if (event.url !== uri) {
                            this.webview.stopLoading();
                            Linking.openURL(event.url);
                        }
                    }}
                />
            </View>
        );
    }
}