let filters = [];
let myDevice;
let myServer;
let myService;
let myChars;
let myCharacteristic;
let myServiceUUID = '953f08c4-8c8f-46f4-a48b-07c18dfb3447';
let flag = '000';
let myCharacteristicUUID = '58590b45-241a-4230-b020-700ac827a8fb';
let uint8array = new TextEncoder()
let string = new TextDecoder()

async function getDevice() {
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
    try {
        console.log('Requesting Bluetooth Device...');
        console.log('with ' + JSON.stringify(options));
        myDevice = await navigator.bluetooth.requestDevice(options);
        console.log('> Name:             ' + myDevice.name);
        console.log('> Id:               ' + myDevice.id);
        console.log('> Connected:        ' + myDevice.gatt.connected);
    } catch(error)  {
        console.log('Argh! ' + error);
    }
}
async function getServer() {
    try {
        if (!myDevice) {
            myDevice = await getDevice()
        }
        myServer = await myDevice.gatt.connect();
    } catch (error) {
        console.log('Argh! ' + error)
    }
}
async function getService() {
    try {
        if (!myServer) {
            myServer = await getServer()
        }
        myService = await myServer.getPrimaryService(myServiceUUID);
    } catch (error) {
        console.log('Argh! ' + error)
    }
}
async function getChars() {
    try {
        if (!myService) {
            myService = await getService()
        }
        myChars = await myServer.getCharacteristics()
    } catch (error) {
        console.log('Argh! ' + error)
    }
}
async function getChar() {
    try {
        if (!myChars) {
            await getChars()
        }
        for (let chars in myChars) {
            if (chars.uuid === myCharacteristicUUID) {
                myCharacteristic = chars
            }
        }
        myCharacteristic.startNotifications().then(subscribeToChanges)
    } catch (error) {
        console.log('Argh! ' + error)
    }
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

async function getCurrentValue() {
    try {
        if (!myCharacteristic) {
            await getChar();
        }
        let value = await myCharacteristic.readValue()
        flag = string.decode(value)
        console.log(flag)
    } catch (error) {
        console.log('Argh! ' + error)
    }
}

async function writeVal(newFlag) {
    if (!myCharacteristic) {
        await getChar();
    }

    let commandValue = new Uint8Array(uint8array.encode(newFlag));

    try {
        myCharacteristic.writeValue(commandValue);
    } catch (error) {
        console.log('Argh! ' + error)
    }
}

function bleDisconnect() {
    if (myDevice) {
        myDevice.gatt.disconnect();
    }
}