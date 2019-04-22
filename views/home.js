import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, NetInfo, Image, TouchableOpacity, AsyncStorage, AppRegistry, Alert, CameraRoll, Button, BackHandler } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import MultiSelect from 'react-native-multiple-select';
import { Constants, Location, Permissions,  } from 'expo';
import supermercados from './supermercados';
import productos from './productos';
import categorias from './categorias';

// automatico saco las cadenas de los supermercados
let cadenas = [... new Set(supermercados.map(x => x.nombre))];

// post process productons




export default class Sincro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seccion: "inicio",
            cadena:null,
            sucursal:null,
            selectedItems: [],
        };
    }

  
onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
};


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        switch (this.state.seccion) {
            case 'cadena':
                this.setState({ seccion: 'inicio'});
                break;
            case 'categoria':
                this.setState({ seccion: 'sucursal' });
                break;
            case 'sucursal':
                this.setState({ seccion: 'cadena' });
                break;
            case 'producto':
                this.setState({ seccion: 'sucursal' });
                break;
            case 'formulario':
                this.setState({ seccion: 'producto' });
                break;
            default:
                break;
        }
       
        return true;
    }

   goto = (to)=>{
       this.setState({seccion:to})
   }

   setCadena = (cadena)=>{
    this.setState({cadena:cadena})
    this.goto('sucursal')
   }

    setSucursal = (sucursal) => {
        this.setState({ sucursal: sucursal })
        this.goto('producto')
    }
    

   viewCadenas = () =>{
       let botones = []

       for (let index = 0; index < cadenas.length; index++) {
           botones.push(
               <TouchableOpacity 
               key={"cadena_" + index} 
                   onPress={() => this.setCadena(cadenas[index])}
               style={styles.button}
               > 
                  <Text styles={{fontSize:24,color:"white"}}> {cadenas[index]}</Text>
               </TouchableOpacity>
           )
       }
       return <View style={styles.view}>
                    <Text>Seleccionar Cadena</Text>
                    {botones}
                </View>
   }

   viewSucursales = () =>{
       let botones = []
        console.log("Mostrando Sucursales de "+this.state.cadena)
       for (let index = 0; index < supermercados.length; index++) {
           if(this.state.cadena == supermercados[index].nombre){
               botones.push(
                   <TouchableOpacity
                       key={"cadena_" + index}
                       onPress={() => this.setSucursal(supermercados[index].id)}
                       style={styles.button}
                   >
                       <Text styles={{ fontSize: 24, color: "white" }}> {supermercados[index].ubicacion}</Text>
                   </TouchableOpacity>
               )
           }
       }
       return <View style={styles.view}>
               <Text>Seleccionar Sucursal</Text>
           <ScrollView>
               {botones}
           </ScrollView>
       </View>

       
   }



   onSelectedItemsChange = () =>{
       console.log("Change")
   }


    

    render() {
        const { selectedItems } = this.state;
        return (
          
               
            
            <View style={styles.container}>
               
               {this.state.seccion == 'inicio' &&
                <View style={styles.view}>
                    <TouchableOpacity style={styles.button} onPress={() => this.goto('cadena')}>
                        <Text style={styles.button_text}>Nueva Carga</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.button_text}>Subir Carga</Text>
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={{ color: "#9a9a9a" }}>{Constants.installationId}</Text>
                    </View>
                </View>
                }
                {this.state.seccion == 'cadena' &&
                this.viewCadenas()
                }
                {this.state.seccion == 'categoria' &&
                    <View>
                        <Text>Seleccionar Categoria</Text>
                    <TouchableOpacity style={styles.button} onPress={() => this.goto('sucursal')}>
                        <Text style={styles.button_text}>Nueva Carga</Text>
                    </TouchableOpacity>
                    </View>
                }
                {this.state.seccion == 'sucursal' &&
                   this.viewSucursales()
                }
                {this.state.seccion == 'producto' &&
                    <View >
                        <MultiSelect
                            hideTags
                            items={productos}
                            uniqueKey="id"
                            ref={(component) => { this.multiSelect = component }}
                            onSelectedItemsChange={this.onSelectedItemsChange}
                            selectedItems={selectedItems}
                            selectText="Productos"
                            searchInputPlaceholderText="Buscar..."
                            onChangeInput={(text) => console.log(text)}
                            // altFontFamily="ProximaNova-Light"
                            tagRemoveIconColor="#CCC"
                            tagBorderColor="#CCC"
                            tagTextColor="#CCC"
                            selectedItemTextColor="#CCC"
                            selectedItemIconColor="#CCC"
                            itemTextColor="#000"
                            displayKey="displayName"
                            single={true}
                            searchInputStyle={{ color: '#CCC' }}
                            submitButtonColor="#CCC"
                            submitButtonText="Submit"
                        />
                    </View>
                }
                {this.state.seccion == 'formulario' &&
                    <View>
                        <Text>Form</Text>
                    </View>
                }
                
            
    
    
    
    
                
                
                
    
            </View>
        );
    }

   
}


const styles = StyleSheet.create({
    view:{
            justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginTop: 10,
        height: 30,

        flexDirection: 'row',
    },
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#f2f2f0',
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
    button: {
        marginBottom: 30,
        width: 260,
        height:50,
        alignItems: 'center',
        backgroundColor: '#8fbd4d'
    },
    button_text: {
        // padding: 20,
        fontSize: 24,
        color: 'white'
    }

})

AppRegistry.registerComponent('NetworkCheck', () => IsConnected);
