const manualLightModeUUID = '953f08c4-8c8f-46f4-a48b-07c18dfb3447';
const moodLightModeServiceUUID = 'a9a23424-73cc-4140-80ea-b2eecc335760';
const changeLightIntensityChar = '9de2dcc7-f9e4-4372-a559-05c41e37914e';
const alarmSettingChar = 'bb2d7591-b7e4-4fc3-ae11-66a1cb637153';
const changeColourChar = '92915619-d075-499e-a072-0da6f7325d37';

/* Pills */

document.getElementById('color').addEventListener('click', (e) => {
    document.body.classList.remove('color', 'customize');
    document.body.classList.add('color');
});

document.getElementById('customize').addEventListener('click', (e) => {
    document.body.classList.remove('color', 'customize');
    document.body.classList.add('customize');
});

/* Inject styles in the editor */

var style = document.getElementById('style');

function injectStyle(c) {
    if (c) {
        style.innerHTML =
            "#bulb {\n" +
            "    fill: " + c + ";\n" +
            "}";
    }
    else {
        style.innerHTML = '';
    }
}

/* Color swatches */

var controls = document.getElementById('colorView');

controls.addEventListener('mousedown', handleMouseEvent);
controls.addEventListener('touchstart', handleMouseEvent);

function handleMouseEvent(event) {
    if (event.target.tagName !== 'BUTTON') {
        return;
    }

    var c = event.target.dataset.value;
    injectStyle(c);

    event.preventDefault();
}




/* Watch CSS animations */

var lastColor = '#cccccc';

var bulb = document.getElementById('bulb');

function watcher() {
    color = normalizeColor(window.getComputedStyle(bulb).fill);

    if (color !== lastColor) {
        lastColor = color;
        BluetoothBulb.color = color;
    }
}

window.setInterval(watcher, 100);

/* Connect to device */

document.getElementById('connect')
    .addEventListener('click', () => {
        BluetoothBulb.connect()
            .then(() => {
                document.body.classList.add('connected');
                injectStyle(BluetoothBulb.color);

                BluetoothBulb.addEventListener('disconnected', () => {
                    document.body.classList.remove('connected');
                    injectStyle();
                });
            });
    });

document.getElementById('emulate')
    .addEventListener('click', () => {
        emulateState = true;
        document.body.classList.add('connected');

        injectStyle();
    });

/* Color format conversion */

function normalizeColor(rgb) {
    if (rgb.search("rgb") === -1) {
        return rgb;
    }
    else if (rgb === 'rgba(0, 0, 0, 0)') {
        return 'transparent';
    }
    else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
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