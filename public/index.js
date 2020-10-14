const manualLightModeUUID = '953f08c4-8c8f-46f4-a48b-07c18dfb3447';
const moodLightModeServiceUUID = 'a9a23424-73cc-4140-80ea-b2eecc335760';
const changeLightIntensityChar = '9de2dcc7-f9e4-4372-a559-05c41e37914e';
const alarmSettingChar = 'bb2d7591-b7e4-4fc3-ae11-66a1cb637153';
const changeColourChar = '92915619-d075-499e-a072-0da6f7325d37';

function onButtonClick() {
    // let filters = [];
    //
    // let filterService = document.querySelector('#service').value;
    // if (filterService.startsWith('0x')) {
    //     filterService = parseInt(filterService);
    // }
    // if (filterService) {
    //     filters.push({services: [filterService]});
    // }
    //
    // let filterName = document.querySelector('#name').value;
    // if (filterName) {
    //     filters.push({name: filterName});
    // }
    //
    // let filterNamePrefix = document.querySelector('#namePrefix').value;
    // if (filterNamePrefix) {
    //     filters.push({namePrefix: filterNamePrefix});
    // }

    let options = {};
    options.acceptAllDevices = true;

    console.log('Requesting Bluetooth Device...');
    console.log('with ' + JSON.stringify(options));
    navigator.bluetooth.requestDevice(options)
        .then(device => {
            console.log('> Name:             ' + device.name);
            console.log('> Id:               ' + device.id);
            console.log('> Connected:        ' + device.gatt.connected);
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

// let device, alarmChar, lightInstensityChar, colourChooser;
// connectButton.onclick = async () => {
//     device = await navigator.bluetooth
//         .requestDevice({
//             filters: [{
//                 services: [manualLightModeUUID, moodLightModeServiceUUID]
//             }]
//         });
//     const server = await device.gatt.connect();
//     const moodLightModeService =
//         await server.getPrimaryService(manualLightModeUUID);
//     const manualLightService =
//         await server.getPrimaryService(manualLightModeUUID)
//
//     lightInstensityChar =
//         await moodLightModeService.getCharacteristic(changeLightIntensityChar);
//     alarmChar =
//         await moodLightModeService.getCharacteristic(alarmSettingChar);
//     colourChooser =
//         await manualLightService.getCharacteristic(changeColourChar);
//
//     device.ongattserverdisconnected = disconnect;
//     onnected.style.display = 'block';
//     connectButton.style.display = 'none';
//     disconnectButton.style.display = 'initial';
// };
//
// const disconnect = () => {
//     device = null;
//     lightInstensityChar = null;
//     alarmChar = null;
//     colourChooser = null;
//     connected.style.display = 'none';
//     connectButton.style.display = 'initial';
//     disconnectButton.style.display = 'none';
// };
//
// disconnectButton.onclick = async () => {
//     await device.gatt.disconnect();
//     disconnect();
// };