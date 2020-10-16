let filters = [];
let myDevice;
let myServer;
let myService;
let myCharacteristic;
let myServiceUUID = '953f08c4-8c8f-46f4-a48b-07c18dfb3447';
let flag = '000';
let myCharacteristicUUID = '58590b45-241a-4230-b020-700ac827a8fb';
let uint8array = new TextEncoder()
let string = new TextDecoder()

function getDevice() {
    let services = [myServiceUUID];
    if (services) {
        filters.push({services: services});
    }

    let filterName = 'Moodify';
    if (filterName) {
        filters.push({name: filterName});
    }

    let options = {};
    options.filters = filters;

    console.log('Requesting Bluetooth Device...');
    console.log('with ' + JSON.stringify(options));
    navigator.bluetooth.requestDevice(options)
        .then(device => {
            console.log('> Name:             ' + device.name);
            console.log('> Id:               ' + device.id);
            console.log('> Connected:        ' + device.gatt.connected);
            // save the device returned so you can disconnect later:
            myDevice = device;
            console.log(device);
            // connect to the device once you find it:
            return device.gatt.connect();
        })
        .then(function(server) {
            myServer = server;
            // get the primary service:
            return server.getPrimaryService(myServiceUUID);
        })
        .then(function(service) {
            myService = service
            // get the  characteristic:
            return service.getCharacteristics();
        })
        .then(function(characteristics) {
            // subscribe to the characteristic:
            for (let c in characteristics) {
                if (characteristics[c].uuid === myCharacteristic) {
                    myCharacteristic = characteristics[c];
                    myCharacteristic.startNotifications()
                        .then(subscribeToChanges)
                }
            }
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

// subscribe to changes from the meter:
function subscribeToChanges(characteristic) {
    characteristic.oncharacteristicvaluechanged = handleData;
}

function handleData(event) {
    // get the data buffer from the meter:
    const buf = new Uint8Array(event.target.value);
    console.log(string.decode(buf));
}

function getCurrentValue() {
    myCharacteristic.readValue()
        .then(value => {
            console.log('Current value is: ' + value);
            flag = string.decode(value);
        })
        .catch(error => {
            console.log('Error: ', error);
        })
}

function writeVal(newFlag) {
        let commandValue = new Uint8Array(uint8array.encode(newFlag));
        myCharacteristic.writeValue(commandValue)
        .catch(error => {
            console.log(error);
        })
}

function disconnect() {
    if (myDevice) {
        // disconnect:
        myDevice.gatt.disconnect();
    }
}