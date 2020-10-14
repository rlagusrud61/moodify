(function() {
    'use strict';
    const manualLightModeUUID = '953f08c4-8c8f-46f4-a48b-07c18dfb3447';
    const moodLightModeServiceUUID = 'a9a23424-73cc-4140-80ea-b2eecc335760';
    const changeLightIntensityChar = '9de2dcc7-f9e4-4372-a559-05c41e37914e';
    const alarmSettingChar = 'bb2d7591-b7e4-4fc3-ae11-66a1cb637153';
    const changeColourChar = '92915619-d075-499e-a072-0da6f7325d37';

    const BULBS = [

        /* Playbulb */
        {
            'filters':	[ { service: [manualLightModeUUID, moodLightModeServiceUUID] } ],
            'optionalServices': [],

            'write':	{
                'service':			0xff00,
                'characteristic':	0xfffc,
                'format':			(r, g, b) => new Uint8Array([ 0x00, r, g, b  ])
            },

            'read': {
                'service':			0xff00,
                'characteristic':	0xfffc,
                'interpret':		(buffer) => new Object({ r: buffer.getUint8(1), g: buffer.getUint8(2), b: buffer.getUint8(3) })
            }
        },
        {
            'filters':	[ {} ],
            'optionalServices': [],
        }
    ]


    class BluetoothBulb {
        constructor() {
            this._EVENTS = {}
            this._SERVER = null;

            this._BULB = null;
        }

        connect() {
            console.log('Requesting Bluetooth Device...');

            return new Promise((resolve, reject) => {
                navigator.bluetooth.requestDevice({ 'acceptAllDevices': true })
                    .then(device => {
                        console.log('Connecting to GATT Server...');
                        device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
                        return device.gatt.connect();
                    })
                    .then(async server => {
                        let filteredBulbs = BULBS.filter(item => {
                            return item.filters.filter(filter => filter.namePrefix && server.device.name.indexOf(filter.namePrefix) === 0).length;
                        });

                        for (const bulb of filteredBulbs) {
                            let match = true;

                            for (const service of bulb.optionalServices) {
                                try {
                                    await server.getPrimaryService(service);
                                }
                                catch {
                                    match = false;
                                }
                            }

                            if (match) {
                                this._BULB = bulb;
                                return server;
                            }
                        }
                    })
                    .then(server => {
                        this._SERVER = server;

                        if (this._BULB.read || this._BULB.notify) {
                            this._retrieveColor().then((c) => {
                                this._COLOR = this._rgbToHex(c.r, c.g, c.b);
                                resolve();
                            })
                        } else {
                            this._COLOR = "#ffffff";
                            resolve();
                        }
                    })
                    .catch(error => {
                        console.log('Argh! ' + error);
                        reject();
                    });
            });

        }

        addEventListener(e, f) {
            this._EVENTS[e] = f;
        }

        isConnected() {
            return !! this._SERVER;
        }

        get color() {
            return this._COLOR;
        }

        set color(color) {
            if (!this._SERVER) return;

            this._COLOR = color;

            this._SERVER.getPrimaryService(this._BULB.write.service)
                .then(service => {
                    return service.getCharacteristic(this._BULB.write.characteristic)
                })
                .then(characteristic => {
                    var c = parseInt(color.substring(1), 16);
                    var r = (c >> 16) & 255;
                    var g = (c >> 8) & 255;
                    var b = c & 255;

                    var buffer = this._BULB.write.format(r, g, b);
                    return characteristic.writeValue(buffer);
                })
                .catch(error => {
                    console.log('Argh! ' + error);
                });
        }

        _disconnect() {
            console.log('Disconnected from GATT Server...');

            this._SERVER = null;

            if (this._EVENTS['disconnected']) {
                this._EVENTS['disconnected']();
            }
        }

        _retrieveColor() {
            return new Promise((resolve, reject) => {
                if (this._BULB.read) {
                    this._SERVER.getPrimaryService(this._BULB.read.service)
                        .then(service => {
                            return service.getCharacteristic(this._BULB.read.characteristic)
                        })
                        .then(characteristic => {
                            return characteristic.readValue()
                        })
                        .then(data => {
                            resolve(this._BULB.read.interpret(data));
                        })
                }

                if (this._BULB.notify) {
                    this._SERVER.getPrimaryService(this._BULB.notify.listen.service)
                        .then(service => {
                            return service.getCharacteristic(this._BULB.notify.listen.characteristic)
                        })
                        .then(characteristic => {
                            /* Start listening for status notifications */

                            characteristic.addEventListener('characteristicvaluechanged', event => {
                                resolve(this._BULB.notify.listen.interpret(event.target.value));
                            });

                            characteristic.startNotifications();

                            /* Send playload to trigger status update */

                            this._SERVER.getPrimaryService(this._BULB.notify.write.service)
                                .then(service => {
                                    return service.getCharacteristic(this._BULB.notify.write.characteristic)
                                })
                                .then(characteristic => {
                                    return characteristic.writeValue(this._BULB.notify.write.payload);
                                })
                                .catch(error => {
                                    console.log('Argh! ' + error);
                                });
                        })
                }
            });
        }

        _rgbToHex(red, green, blue) {
            var rgb = blue | (green << 8) | (red << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1)
        }
    }

    window.BluetoothBulb = new BluetoothBulb();
})();
