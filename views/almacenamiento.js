

storage = {}


    storage.ViewData = async () => {
        try {
            let data = await AsyncStorage.getItem('data');
            console.log(data);

        } catch (error) {
            alert(error)
        }
    }


export default storage;