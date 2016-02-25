import React, {
  Component,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  ScrollView,
  ProgressBarAndroid,
  TouchableNativeFeedback,
  AsyncStorage,
  NativeModules
} from 'react-native';
var STORAGE_KEY = '@AsyncStorageTodo:key';

var FBLogin = require('react-native-facebook-login');
var FBLoginManager = NativeModules.FBLoginManager;

var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var FBInstance = React.createClass({
  getInitialState: function() {
    return {
      user: ''
    };
  },
  async getSession(){
    try {
      var value = await AsyncStorage.getItem(STORAGE_KEY);
      console.log(value);
      if(isMounted){
      this.setState({
        user:value
      });
      }
      this.props.onLogin(value);
      } catch (error) {
      console.log(error);
    }
  },

  async setSession(e){
    try {
      await AsyncStorage.setItem(STORAGE_KEY,e);
      } catch (error) {
      console.log(error);
    }
  },

  componentDidMount() {
    this.getSession();
  },

  render() {
    return (
    <View style={{flex:1}}>
      <FBLogin
        onLogin={(e)=>{
          e='logged';
          this.setSession(e);
          this.props.onLogin(e);
        }}
        onLogout={(e)=>{
          e ='loggedout';
          this.props.onLogout(e);
        }}
        onCancel={function(e){console.log(e)}}
        onPermissionsMissing={function(e){console.log(e)}}
      />
    </View>);
  }
});

module.exports = FBInstance;
