import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Platform, NetInfo, Image, AsyncStorage, AppRegistry, Alert, CameraRoll, BackHandler,KeyboardAvoidingView } from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';
import MultiSelect from 'react-native-multiple-select';
import t from 'tcomb-form-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Form, Item, Input, Grid, Row, Col,H1,H2,H3 } from 'native-base';
import { Font, Constants, Location, Permissions, BarCodeScanner } from 'expo';
import supermercados from './supermercados';
import productos from './productos.json';
import categorias from './categorias';
import marcas from './marcas';
import marca_productos from './marca_productos';
import moment from 'moment';

// automatico saco las cadenas de los supermercados
let cadenas = [... new Set(supermercados.map(x => x.nombre))];

// post process productons
var Formulario = t.form.Form;
// console.log(productos);
// here we are: define your domain model
var precio = t.struct({
    latitud: t.maybe(t.Number),///automaticos
    longitud: t.maybe(t.Number),///automaticos
    userid: t.maybe(t.String),
    timestamp: t.maybe(t.String),
    supermercado:t.Number,//hidden
    producto:t.Number,
    marca:t.Number,

    // 
    disponibilidad: t.Boolean,//hidden        // a boolean
    precio_lista: t.maybe(t.Number),              // a required string
    promo:t.Boolean,
    promo_tipo: t.maybe(t.enums({
        promo_simple: "Simple", 
        promo_2_x_1: "2 x 1",
        promo_3_x_2:"3 x 2",
        promo_70: "70% en la 2da Unidad",
    })),
    promo_descripcion:t.maybe(t.String),
    precio_promocion:t.maybe(t.Number),
    promo_desde:t.maybe(t.Date),
    promo_hasta:t.maybe(t.Date),
    
      // an optional string
    // a required number
});



var form_options = {
    i18n: {
        optional: '',
        required: ''
    },
    fields: {
        latitud: {
            hidden: true
        },
        
        longitud: {
            hidden: true
        },
        timestamp:{
            hidden:true,
        },
        disponibilidad:{
            label:"Disponibilidad",
        },
        userid: {
            hidden: true
        },
        supermercado:{
            hidden: true
        },
        marca:{
            hidden:true
        },
        producto:{
            hidden: true
        },
        precio_lista:{
            label:"Precio de Lista por unidad",
            hidden:false,
        },
        promo_tipo:{
            label: "Tipo de Promoción",
            hidden: true,
        },
        promo_descripcion: {
            label:"Detalle de la promocion",
              hidden: true,
        },
        precio_promocion: {
            label:"Precio de promocion por unidad",
              hidden: true,
        },
        promo_desde:{
            label:"Promo Vigente Desde",
            defaultValueText:"-",
            mode:'date',
            hidden:true,
            config:{
                defaultValueText:"Seleccionar Fecha",
                format:(date)=> myFormatFunction("DD/MM/YYYY",date)
            }
        },
        promo_hasta: {
            label: "Hasta",
            defaultValueText: "-",
            mode: 'date',
            hidden:true,
            config:{
                defaultValueText:"Seleccionar Fecha",
                format:(date)=> myFormatFunction("DD/MM/YYYY",date)
            }
        }

    }
} // optional rendering options (see documentation)
 let myFormatFunction = (format,date) =>{
            return moment(date).format(format);
        }
var form_defaults = {
    userid: Constants.installationId,
    latitud: null,
    longitud: null,
    disponibilidad:true,
    // fecha_realizacion: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
}


export default class Sincro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner:false,
            options: form_options,
            value: form_defaults,
            seccion: "inicio",
            cadena:null,
            count:0,
            sucursal:null,
            isConnected: null,
            selectedItems: [],
            loaded:false,
            header:"Recolección de Precios",
            value: form_defaults,
            // 
            hasCameraPermission: null,
            scanned: false,
            // servers
            server: 'sambrana.com.ar/',
            server: '192.168.43.137/',

        };
    }



async   componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );
        NetInfo.isConnected.fetch().done(
            (isConnected) => { this.setState({ isConnected }); }
        );

         const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });

     
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
            this.updateCount();
        } catch (error) {

        }

        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );
      

    }
    _handleConnectivityChange = (isConnected) => {
        this.setState({
            isConnected,
        });
    };



    handleBackPress = () => {
        switch (this.state.seccion) {
            case 'cadena':
                this.setState({ seccion: 'inicio'});
                this.setState({header:'Recolección de Precios'});
                break;
                case 'sucursal':
                    this.setState({ seccion: 'cadena' });
                    this.setState({header:'Seleccione Cadena'});
                    break;
            case 'categoria':
                this.setState({ seccion: 'sucursal' });
                this.setState({header:"Seleccione Sucursal"})
                break;
            case 'producto':
                this.setState({ seccion: 'categoria' });
                this.setState({header:"Seleccione Categoria"})
            case 'producto_listado':
                this.setState({ seccion: 'categoria' });
                this.setState({header:"Seleccione Categoria"})
                break;
            case 'marca':
                this.setState({ seccion: 'producto_listado' });
                this.setState({ header:'Seleccione Producto'});
                break;
            case 'formulario':
                this.setState({ seccion: 'marca' });
                this.setState({ header:'marca'});
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
    this.setState({header:"Seleccione Sucursal"})
   }

    setSucursal = (sucursal) => {
        this.setState({ sucursal: sucursal })

        let _value = this.state.value;
        _value.supermercado = sucursal;
        this.setState({value:_value})
        this.goto('categoria')
        this.setState({header:"Seleccione Categoria"})
    }

    setCategoria = (categoria) => {
        this.setState({ categoria: categoria })
        
        console.log("Filtro por "+categoria.id+" "+categoria.nombre)
        this.state.filterProductos = productos.filter(producto => producto.categoria_id == categoria.id);
        
       
        // this.goto('producto')
        this.goto('producto_listado')
        this.setState({header:"Seleccione Producto"})
    }

    setProducto = (prod) =>{
        this.setState({ selectedProducto:prod});
        // 
        let _value = this.state.value;
        _value.producto = prod.id;
        this.setState({value:_value})
        // 

        this.goto('marca')
        this.setState({header:"Seleccione Marca del Producto"})
    }

    setMarca = (marca) => {
        this.setState({ selectedMarca: marca });
        // 
        let _value = this.state.value;
        _value.marca = marca.id;
        // _value.producto = prod.id;
        this.setState({ value: _value })
        // 

        this.goto('formulario')
        this.setState({header:"Complete Información del Producto"})
    }



    

    viewMarca = () =>{
        let botones = [];
        let marca_filter = [];
        
        _marcas = marca_productos.filter(mp => mp.producto_id == this.state.selectedProducto.id)
        marcas.forEach(el => 
            {
                _marcas.forEach(inner => {
                    if (el.id == inner.marca_id)
                        {
                            marca_filter.push(el);
                        }
                })
            });
        // 

        for (let index = 0; index < marca_filter.length; index++) {
            botones.push(
                <Button full
                    key={"cadena_" + index}
                    onPress={() => this.setMarca(marca_filter[index])}
                >
                    <Text> {marca_filter[index].nombre}</Text>
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
    
    viewProductoListado = () =>{
        let botones = []

        for (let index = 0; index < this.state.filterProductos.length; index++) {
            botones.push(
                <Button full
                    key={"cadena_" + index}
                    onPress={() => this.setProducto(this.state.filterProductos[index])}
                >
                    <Text> {this.state.filterProductos[index].nombre + "-" + this.state.filterProductos[index].peso}</Text>
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
                <Button 
                onPress={() => this.setState({seccion:"barcode"})} success full large iconRight> 
                    <Icon name="barcode" />
                    <Text>Leer Código de Barras</Text>

                </Button>
                <Text></Text>
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

    onChange = (value) => {
        var update_options = this.state.options;

        // actualizalar los campos foto
        // value.foto_plato_desayuno = this.state.foto_plato_desayuno
        // value.foto_plato_almuerzo = this.state.foto_plato_almuerzo
        // value.foto_plato_merienda = this.state.foto_plato_meriend

        // 1.5 Informante Clave
        if (value.disponibilidad) 
            {
                update_options = t.update(update_options, {
                    fields: { precio_lista: { hidden: { '$set': false } } }
                })
            }
            else {
                update_options = t.update(update_options, {
                    fields: { precio_lista: { hidden: { '$set': true } } }
                })
            }
            
        if(value.promo)
        {
            update_options = t.update(update_options, {
                fields: { promo_tipo: { hidden: { '$set': false } },
                    promo_descripcion: { hidden: { '$set': false } }  ,
                    precio_promocion: { hidden: { '$set': false } },
                    promo_desde: { hidden: { '$set': false } },
                    promo_hasta: { hidden: { '$set': false } },
                        }
            })
        }
        else {
            update_options = t.update(update_options, {
                fields: {
                    promo_tipo: { hidden: { '$set': true } },
                    promo_descripcion: { hidden: { '$set': true } },
                    precio_promocion: { hidden: { '$set': true } },
                    promo_desde: { hidden: { '$set': true } },
                    promo_hasta: { hidden: { '$set': true } },
                }
            })
        }  
    

        // 
        var d = new Date()
        value.timestamp = Math.floor(d.getTime() / 1000) + ""

        if (this.state.errorMessage) {

        } else if (this.state.location) {

            value.longitud = this.state.location.coords.longitude;
            value.latitud = this.state.location.coords.latitude;
        }


        this.setState({ options: update_options, value: value });
        console.log(value);
    }
    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({ maximumAge: 300000 });
        this.setState({ location });
        // console.log("Get LOcation")
        // console.log(location);
    }

    submit = async () => {
        
            nuevo = this._form.getValue(); // use that ref to get the form value
            ///get current data
            if (!nuevo) {
                alert("Complete todo los campos");
                return
            }

            if (nuevo.disponibilidad) {
                if (nuevo.precio_lista == undefined)
                {
                    alert("Complete el precio de lista");
                    return
                }
            }
            if (nuevo.promo) {
                if (nuevo.promo_tipo == undefined) {
                    alert("Complete el Tipo de Promocion");
                    return
                }

                if (nuevo.precio_promocion == undefined) {
                    alert("Complete el precio de promocion");
                    return
                }
                
            }

            // obtengo el marca producto para la base de guishe

            this.saveData(nuevo);
    }

    saveData = async(nuevo) => 
    {

        try {
            let data = await AsyncStorage.getItem('data');// obtengo registros guardados anteriormente
            if (data !== null)//ya hay algo cargado?
            {
                //convierto string a objeto !
                data = JSON.parse(data);
                //nuevo objeto 
                // var nuevo = { nombre: 'ivan', apellido: 'sambrana' };///se crea al inicio del metodos

                //inserto nuevo objeto
                data.push(nuevo);
                //convierto de nuevo a string!
                data = JSON.stringify(data);
                //guardo en el coso locol
                AsyncStorage.setItem('data', data);
                //muestro en consola por la dua
                console.log("data: ")
                console.log(data);

            }
            else {//es el primero asi que se inicializa
                data = [];
                data.push(nuevo);
                AsyncStorage.setItem('data', JSON.stringify(data));
                console.log("array")
                console.log(data);

            }
            alert("Producto Guardado")
            this.cleanForm();
            this.updateCount();
            this.setState({seccion:"marca"});
        } catch (error) {
            
        }
    }

    cleanForm = ()=>{
        let _value = this.state.value;
        _value.precio_lista = undefined;
        _value.promo_descripcion = undefined;
        _value.promo_tipo = undefined;
        _value.precio_promocion = undefined;
        this.setState({ value: _value })
    }

 

    enviar = async () => {
       
        if (this.state.isConnected) {


            let server = this.state.server+"precios/send";
            console.log("send data to " + server);
            this.setState({ spinner: true });

            try {
                let data = await AsyncStorage.getItem('data');
                if (data !== null)//ya hay algo cargado?
                {
                    
                    console.log(data);
                    
                    const myRequest = new Request(server,
                        {
                            method: 'POST',
                            body: data
                        });


                    fetch(myRequest)
                        .then(response => {
                            if (response.status === 200) {
                                this.setState({ spinner: false });
                                //  alert('Actualizado')
                                Alert.alert(
                                    'Carga Actualizada',
                                    'Presione Aceptar para continuar',
                                    [
                                        { text: 'Aceptar', onPress: () => console.log('OK Pressed') },
                                    ],
                                    { cancelable: false },
                                );
                            } else {
                                console.log(response);
                                throw new Error('Something went wrong on api server!');
                            }
                        })
                        .then(response => {
                            // console.log("Debug")
                            console.debug(response);
                            // ...
                        }).catch(error => {
                            // console.error(error);
                            console.log(error)
                            // alert("Carga Actualizada*")
                            this.setState({spinner:false})
                        });

                    // fin de envio
                }
                else {
                    this.setState({ spinner: false });
                    alert("No Hay Encuestas que Enviar")
                }


            } catch (error) {
                console.log(error)
                this.setState({ spinner: false });
            }
        }
        else {
            alert("No hay Coneccion a Internet");
            this.setState({ spinner: false });
        }

    }

    updateCount = async () => 
    {
       try {
           console.log("Update Count")
           let data = await AsyncStorage.getItem('data');// obtengo registros guardados anteriormente
           if (data !== null)//ya hay algo cargado?
           {
               //convierto string a objeto !
               data = JSON.parse(data);
               var d = new Date()

               hoy = d.getFullYear + "-" + d.getMonth + "-" + d.getDate;


               filtro = data.filter(e => this.toFecha(e.timestamp) == hoy);
               console.log(filtro.length);
               this.setState({ 'count': filtro.length })
           }
           else {
               this.setState({ 'count': 0 })
               console.log(0);

           }
       } catch (error) {
           console.log(error)
       }
    }

    toFecha = (f) =>{
        var d = new Date(f * 1000);
        return d.getFullYear + "-" + d.getMonth + "-" + d.getDate;
    }

    findProducto = (prod) =>{
        return false;
    }


     handleBarCodeScanned = ({ type, data }) => 
     {
            // this.setState({ scanned: true });
            // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
            prod = this.findProducto(data);

            if(prod)
            {
                this.goto('formulario');
                this.setState({header:"Complete Información del Producto"})
            }
            else
            {
                alert(`No se encuentra el producto con codigo ${data}`);
                this.goto('categoria');
            }

        };

    viewBarcode = () =>{
          if (this.state.hasCameraPermission === null) 
                {
                     return <Text>Pidiendo Permiso a la Cámara</Text>
                }
            if (this.state.hasCameraPermission === false) 
            {
                    return <Text>Sin Permisos de Cámara</Text>
            }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );
  }
    
  
    render() {
        const { selectedItems } = this.state;
         const { hasCameraPermission, scanned } = this.state;

        if (this.state.loaded) {
            return (
                <Container style={{ paddingTop: Constants.statusBarHeight }}>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Subiendo...'}
                        textStyle={styles.spinnerTextStyle}
                    />
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
                        <Button onPress={() => this.enviar()} success full large iconLeft>
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
                     {this.state.seccion == 'barcode' &&
                        this.viewBarcode()
                    }
                    {this.state.seccion == "producto_listado" &&
                        this.viewProductoListado()
                    }
                    {this.state.seccion == "marca" &&
                        this.viewMarca()
                    }
                    {this.state.seccion == 'formulario' &&
                        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                        <Content padder>
                        
                        <Formulario
                            ref="form"
                            type={precio}
                            ref={c => this._form = c}
                            options={this.state.options}
                            value={this.state.value} 
                            onChange={this.onChange}
                        />
                        <Button full success onPress={this.submit}>
                            <Text>Guardar</Text>
                        </Button>
                      
                        </Content>
                    </KeyboardAvoidingView>
                    }
                    <Footer>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={{ color: "white", flex: 2 }}>ID: {Constants.installationId}</Text>
                            <Text style={{ color: "white", flex: 2 }}>Relevamiento del dia: {this.state.count} Productos</Text>
                        </View>
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
