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

getProductos = () => {
        
       
    const requestProductos = new Request("https://precios.mcypcorrientes.gob.ar/api/producto",
            { method: 'GET'});


        fetch(requestProductos)
            .then(response => {
                if (response.status === 200) {

                    respuesta = JSON.parse(response._bodyText);
                    this.setState({ productos: respuesta });
                    console.log(respuesta)
                    this.render();
                }
                else {
                    console.log("ERROR EN NOTIFICACIONES")
                    console.log(response.status);

                }
            })
    }


  



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
                case 'sucursal':
                    this.setState({ seccion: 'cadena' });
                    break;
            case 'categoria':
                this.setState({ seccion: 'sucursal' });
                break;
            case 'producto':
                this.setState({ seccion: 'categoria' });
            case 'producto_listado':
                this.setState({ seccion: 'categoria' });
                break;
            case 'marca':
                this.setState({ seccion: 'producto_listado' });
            case 'formulario':
                this.setState({ seccion: 'producto_listado' });
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
        this.goto('categoria')
    }

    setCategoria = (categoria) => {
        this.setState({ categoria: categoria })
        
        console.log("Filtro por "+categoria.id+" "+categoria.nombre)
        this.state.filterProductos = productos.filter(producto => producto.categoria_id == categoria.id);
        
       
        // this.goto('producto')
        this.goto('producto_listado')
    }

    setProducto = (prod) =>{
        this.setState({ selectedProducto:prod});
        this.goto('formulario')
    }
    
    viewProductoListado = () =>{
        let botones = []

        for (let index = 0; index < this.state.filterProductos.length; index++) {
            botones.push(
                <TouchableOpacity
                    key={"cadena_" + index}
                    onPress={() => this.setProducto(this.state.filterProductos[index])}
                    style={styles.button}
                >
                    <Text styles={{ fontSize: 24, color: "white" }}> {this.state.filterProductos[index].nombre}</Text>
                </TouchableOpacity>
            )
        }
        return <View style={styles.view}>
            <Text>Seleccionar Producto</Text>
            <ScrollView>
                {botones}
            </ScrollView>
        </View>
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

   
    viewCategorias = () => {
        let botones = []

        for (let index = 0; index < categorias.length; index++) {
            botones.push(
                <TouchableOpacity
                    key={"cadena_" + index}
                    onPress={() => this.setCategoria(categorias[index])}
                    style={styles.button}
                >
                    <Text styles={{ fontSize: 24, color: "white" }}> {categorias[index].id+"-"+categorias[index].nombre }</Text>
                </TouchableOpacity>
            )
        }
        return <View style={styles.view}>
            <Text>Seleccionar Categoria</Text>
            <ScrollView>
                {botones}
            </ScrollView>
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



    onSelectedItemsChange = selectedItems => {
       console.log(productos.filter(p => p.id == selectedItems[0]));
       
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
                    {/* <TouchableOpacity style={styles.button} onPress={() => this.getProductos()}>
                        <Text style={styles.button_text}>Api productos</Text>
                    </TouchableOpacity> */}
                    <View style={styles.header}>
                        <Text style={{ color: "#9a9a9a" }}>{Constants.installationId}</Text>
                    </View>
                </View>
                }
                {this.state.seccion == 'cadena' &&
                this.viewCadenas()
                }
                {this.state.seccion == 'sucursal' &&
                    this.viewSucursales()
                }
                {this.state.seccion == 'categoria' &&
                   this.viewCategorias()
                }
                {this.state.seccion == "producto_listado" &&
                    this.viewProductoListado()
                }
                {this.state.seccion == 'producto' &&
                    <View >
                        <MultiSelect
                            hideTags
                            items={this.state.filterProductos}
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
