/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  Navigator,
  TouchableHighlight,
  DrawerLayoutAndroid,
  View,
  ScrollView,
  ToolbarAndroid,
  ProgressBarAndroid,
  TouchableNativeFeedback,
  NativeModules,
  AsyncStorage
} from 'react-native';

var FBInstance = require('./components/FBInstance');

//global.process = require("process.polyfill");
var DDPClient = require("ddp-client");
var Icon = require('react-native-vector-icons/FontAwesome')
global.process = require('process');

var ddpclient = new DDPClient({
  autoReconnect:true,
  ddpversion:'pre1',
  url:'ws:/192.168.0.6:3000/websocket'
});

class todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentViewIndex: 0,
      user:''
    };
    this.navigationView = this.navigationView.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  };
  _onPressButton(){
    return;
  };


  navigationView(){
    return(
      <View style={{flex: 1, backgroundColor: '#fff'}}>

        <TouchableHighlight
          onPress={
            ()=>{
              this.setState({currentViewIndex: 0});
              this.refs['PrincipalDrawer'].closeDrawer();
            }
          }
          style={styles.drawerList}
          activeOpacity = {0.8}
          underlayColor={'#DDD'}
        >
          <Text>
            Tasks
          </Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={
            ()=>{
              this.setState({currentViewIndex: 1});
              this.refs['PrincipalDrawer'].closeDrawer();
            }
          }
          style={styles.drawerList}
          activeOpacity = {0.8}
          underlayColor={'#DDD'}
        >
          <Text>
            Ajustes
          </Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={
            ()=>{
              this.setState({currentViewIndex: 2});
              this.refs['PrincipalDrawer'].closeDrawer();
            }
          }
          style={styles.drawerList}
          activeOpacity = {0.8}
          underlayColor={'#DDD'}
        >
          <Text>
            Cuenta
          </Text>
        </TouchableHighlight>

      </View>);
  };

  login(e){
    this.setState({
      user: e
    });
  };

  logout(e){
    this.setState({
      user: ''
    });
  };

  async getSession(){
    var STORAGE_KEY = '@AsyncStorageTodo:key';
    try {

      var value = await AsyncStorage.getItem(STORAGE_KEY);
      return value;
      //this.props.onLogin(value);
      } catch (error) {
      console.log(error);
    }
  };

  componentWillMount() {
    var user = this.getSession();
    this.setState({
      user: user
    });
  };

  render() {
    if(this.state.user==='logged'){
      return(
        <View style={{flex:1}}>
          <ToolbarAndroid
          title='AwesomeApp'
          style = {styles.toolbar}
          titleColor={'#E0F2F1'}
          />
        <DrawerLayoutAndroid
          drawerWidth={200}
          drawerPosition={DrawerLayoutAndroid.positions.Left}
          renderNavigationView={this.navigationView}
          ref = {'PrincipalDrawer'}>
          <PageLayout
            currentViewIndex = {this.state.currentViewIndex}
            onLogout = {this.logout}
            onLogin ={this.login}
          />
        </DrawerLayoutAndroid>
      </View>);
    }
    else{
      return(
            <View style={{flex:1}}>
              <FBInstance
                onLogin ={this.login}
                onLogout={this.logout}/>
            </View>
          );
    }
  };
}

var PageLayout = React.createClass({
  render: function() {
    var currentPage = 0;
    switch (this.props.currentViewIndex) {
      case 0:
        currentPage = <TasksIntance />
        break;
      case 1:
        currentPage = <FBInstance onLogin ={this.props.onLogin} onLogout={this.props.onLogout}/>
        break;
      default:
        currentPage = <View style={{flex: 1, backgroundColor: '#F0F'}}/>
    }
    return (
      currentPage
    );
  }
});
module.exports = PageLayout;


var TasksIntance = React.createClass({
  getInitialState: function() {
    return {
      taskInput: '',
      tasks:''
    };
  },

  componentWillUnmount: function() {
    console.log('Component will unmount');
    ddpclient.unsubscribe(this.test);
    ddpclient.close();
    console.log('Component unmount');
  },

  componentDidMount: function() {
    console.log('componentDidMount')
    ddpclient.connect((error, wasReconnect)=> {
      // If autoReconnect is true, this callback will be invoked each time
      // a server connection is re-established
      if (error) {
        console.log('DDP connection error!');
        return;
      }

      if (wasReconnect) {
        console.log('Reestablishment of a connection.');
        return;
      }

      // ddpclient.on('message', function (msg) {
      //   console.log("ddp message: " + msg);
      // });

      this.test = ddpclient.subscribe('tasks',[],()=>{
        var observer = ddpclient.collections.observe(() => {
          return ddpclient.collections.tasks.find();
        });
        observer.subscribe((results) => {
          if (this.isMounted()){
            console.log('set state!');
            this.setState({
              tasks:results
            });
          }
        });
      });
    });

    console.log('componentDidMount finished');
  },

  renderTasks: function(){
    if(this.state.tasks !== ''){
    return(this.state.tasks.sort(function(a, b) {
          a = new Date(a.createdAt);
          b = new Date(b.createdAt);
          return a>b ? -1 : a<b ? 1 : 0;
      }).map((task)=>{
      return <SingleTask key={task._id} task ={task}/> }
      ))}
    else{
      return (
        <ProgressBarAndroid styleAttr={'Inverse'} indeterminate = {true}/>
      );
    }
  },
  addTask: function(){
    //console.log(this.state.taskInput);
    ddpclient.call('addTask',[this.state.taskInput]);
    this.setState({taskInput:''});
  },
  render: function() {

    return (
        <View style={{flex:1}}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Add a task"
              onChangeText={(e) => this.setState({taskInput:e})}
              value={this.state.taskInput}
              onSubmitEditing= {this.addTask}
              />
          </View>
          <ScrollView
            style = {styles.ScrollView}
            contentContainerStyle={styles.ScrollView}
            showsVerticalScrollIndicator = {true}
            horizontal={false}
            scrollEventThrottle={200}
            bounces={true}>
            {this.renderTasks()}
          </ScrollView>
        </View>


    );
  }
});

module.exports = TasksIntance;


var SingleTask = React.createClass({
  getInitialState: function() {
    return {
      textLines: 1
    };
  },
  toggleDone: function(){
    ddpclient.call('changeDone',[this.props.task._id]);
  },
  removeTask:function(){
    ddpclient.call('removeTask',[this.props.task._id]);
  },
  toggleReadMore:function(){
    if(this.state.textLines == 1){
      this.setState({
        textLines: null
      });
    }else {
      this.setState({
        textLines: 1
      });
    }
  },
  render: function() {

    return (
      <TouchableNativeFeedback
        key={this.props.task._id}
        onPress={this.toggleReadMore}
        onLongPress={this.toggleDone}
        background={TouchableNativeFeedback.Ripple('#004D40', false) }
        >
        <View style={styles.singleTask}>
          <Text numberOfLines={this.state.textLines}
            style={[styles.singleTaskText,this.props.task.done && styles.linethrough]}
            >
            {this.props.task.task}
          </Text>
          <TouchableHighlight onPress={this.removeTask} style={styles.singleTaskIcon} >
            <Icon name="remove" size={10} color="#004D40" style={{textAlign:'center'}}  />
          </TouchableHighlight>
        </View>

      </TouchableNativeFeedback>
    );
  }
});

module.exports = SingleTask;

var styles = StyleSheet.create({
  toolbar: {
   	height: 56,
    backgroundColor: '#009688',
  },
  linethrough:{
    color: 'red'
  },
  ScrollView:{
  },
  containerScrollView:{
    flex:1
  },
  container:{
    flex:1,
    paddingTop:50
  },
  drawerList: {
    padding: 10,
  },

  inputContainer:{

  },
  inputText:{
    flex: 0.8,
    fontSize:25,
    color:'#004D40'
  },
  singleTaskText:{
    textAlign:'left',
    flex: 10
  },
  singleTaskIcon:{
    flex:1,
    justifyContent:'center',
  },
  singleTask: {
    padding:10,
    alignItems:'center',
    borderBottomWidth: 1,
    flexDirection:'row'
  },
  tasks:{
    flex:1
  }
});

AppRegistry.registerComponent('todo', () => todo);
