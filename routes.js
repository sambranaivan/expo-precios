import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';


import Home from './views/home';


const Stack = createStackNavigator({
    Home:{screen:Home},

},{initialRouteName:'Home',headerMode:'none'});

const App = createAppContainer(Stack);
export default App;