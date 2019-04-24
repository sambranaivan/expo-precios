import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, NetInfo, Image, AsyncStorage, AppRegistry, Alert, CameraRoll, BackHandler } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import MultiSelect from 'react-native-multiple-select';
import t from 'tcomb-form-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Grid, Row, Col,H1,H2,H3 } from 'native-base';
import { Font, Constants, Location, Permissions,  } from 'expo';
import supermercados from './supermercados';
import productos from './productos';
import categorias from './categorias';

// automatico saco las cadenas de los supermercados
let cadenas = [... new Set(supermercados.map(x => x.nombre))];

// post process productons
var Formulario = t.form.Form;

// here we are: define your domain model
var precio = t.struct({
    Disponible: t.Boolean,        // a boolean
    precio: t.String,              // a required string
      // an optional string
    // a required number
});

var options = {}; // optional rendering options (see documentation)



export default class Sincro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seccion: "inicio",
            cadena:null,
            sucursal:null,
            selectedItems: [],
            loaded:false,
            header:"Recolección de Precios"
        };
    }



    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    async componentWillMount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        try {
            await Font.loadAsync({
                'Roboto': require('native-base/Fonts/Roboto.ttf'),
                'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
                ...Ionicons.font,
            });

            this.setState({ loaded: true })
        } catch (error) {

        }
    }


    handleBackPress = () => {
        switch (this.state.seccion) {
            case 'cadena':
                this.setState({ seccion: 'inicio'});
                this.setState({header:'Recolección de Precios'});
                break;
                case 'sucursal':
                    this.setState({ seccion: 'cadena' });
                    this.setState({header:'cadena'});
                    break;
            case 'categoria':
                this.setState({ seccion: 'sucursal' });
                this.setState({header:'sucursal'});
                break;
            case 'producto':
                this.setState({ seccion: 'categoria' });
                this.setState({header:'categoria'});
            case 'producto_listado':
                this.setState({ seccion: 'categoria' });
                this.setState({header:'categoria'});
                break;
            case 'marca':
                this.setState({ seccion: 'producto_listado' });
                this.setState({header:'producto_listado'});
            case 'formulario':
                this.setState({ seccion: 'producto_listado' });
                this.setState({header:'producto_listado'});
                break;
            default:
                break;
        }
       
        return true;
    }

   goto = (to)=>{
       this.setState({seccion:to})
       this.setState({header:to})
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
                <Button full
                    key={"cadena_" + index}
                    onPress={() => this.setProducto(this.state.filterProductos[index])}
                >
                    <Text> {this.state.filterProductos[index].nombre}</Text>
                </Button>
            )
             botones.push(<Text key={"espacio_" + index}></Text>)///para que haga un especio entre os botones
        }
        return <Container padder>
            
            <ScrollView>
                {botones}
            </ScrollView>
        </Container>
    }

   viewCadenas = () =>{
       let botones = []

       for (let index = 0; index < cadenas.length; index++) {
           botones.push(
               <Button  full large
               key={"cadena_" + index} 
                   onPress={() => this.setCadena(cadenas[index])}
               > 
                  <Text styles={{fontSize:24,color:"white"}}> {cadenas[index]}</Text>
               </Button>
           )
            botones.push(<Text key={"espacio_" + index}></Text>)///para que haga un especio entre os botones
       }
       return <Container padder>
                    <H1>Seleccionar Cadena</H1>
                    {botones}
       </Container>
   }

   
    viewCategorias = () => {
        let botones = []

        for (let index = 0; index < categorias.length; index++) {
            botones.push(
                <Button full
                    key={"cadena_" + index}
                    onPress={() => this.setCategoria(categorias[index])}
                >
                    <Text> {categorias[index].id+"-"+categorias[index].nombre }</Text>
                </Button>
            )
             botones.push(<Text key={"espacio_" + index}></Text>)///para que haga un especio entre os botones
        }
        return <Container padder>
            <Text>Seleccionar Categoria</Text>
            <ScrollView>
                {botones}
            </ScrollView>
        </Container>
    }

   viewSucursales = () =>{
       let botones = []
        console.log("Mostrando Sucursales de "+this.state.cadena)
       for (let index = 0; index < supermercados.length; index++) {
           if(this.state.cadena == supermercados[index].nombre){
               botones.push(
                   <Button full
                       key={"cadena_" + index}
                       onPress={() => this.setSucursal(supermercados[index].id)}
                   >
                       <Text> {supermercados[index].ubicacion}</Text>
                   </Button>
               )
                botones.push(<Text key={"espacio_" + index}></Text>)///para que haga un especio entre os botones
           }
       }
       return <Container padder>
               <Text>Seleccionar Sucursal</Text>
           <ScrollView>
               {botones}
           </ScrollView>
       </Container>

       
   }



    onSelectedItemsChange = selectedItems => {
       console.log(productos.filter(p => p.id == selectedItems[0]));
       
   }


    

    render() {
        const { selectedItems } = this.state;
        if (this.state.loaded) {
            return (
                <Container style={{ paddingTop: Constants.statusBarHeight }}>
                    <Header style={styles.verde}>
                        <Body>
                           <Title>
                              {this.state.header}
                           </Title>
                        </Body>
                    </Header>
                   
                    {this.state.seccion == 'inicio' &&
                        <Content padder>
                        <Button onPress={() => this.goto('cadena')} success full large iconLeft>
                            <Icon name="add" />
                                    <Text>Nueva Carga</Text>
                                </Button>
                                <Text></Text>
                        <Button success full large iconLeft>
                                    <Icon name="cloud-upload"/>
                                    <Text>Subir Carga</Text>
                                </Button>
                        </Content>
                        
                    
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
                    {this.state.seccion == 'formulario' &&
                        <Content padder>
                        <Formulario
                            ref="form"
                            type={precio}
                            options={options}
                        />
                        <Button full success>
                            <Text>Guardar</Text>
                        </Button>
                        </Content>
                    }
                    <Footer>
                        <Text>{Constants.installationId}</Text>
                    </Footer>
                </Container>

            );
        }
        else
        {
            return <View></View>
        }
       
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
    },
    verde: {
        backgroundColor: "#78BE20"
    },

})

AppRegistry.registerComponent('NetworkCheck', () => IsConnected);
