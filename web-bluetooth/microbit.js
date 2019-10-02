let targetDevice = null;

let ledMatrixStateCharacteristic = null;

const LED_SERVICE = "e95dd91d-251d-470a-a062-fa1922dfa9a8";

/*
LED_SERVICE = 'e95dd91d-251d-470a-a062-fa1922dfa9a8';
LED_BITMAP = 'e95d7b77-251d-470a-a062-fa1922dfa9a8';
LED_TEXT = 'e95d93ee-251d-470a-a062-fa1922dfa9a8';
LED_TEXT_SPEED = 'e95d0d2d-251d-470a-a062-fa1922dfa9a8';
LED_SCROLL = 'E95D0D2D-251D-470A-A062-FA1922DFA9A8'
ACCEL_SRV = 'E95D0753-251D-470A-A062-FA1922DFA9A8'
ACCEL_DATA = 'E95DCA4B-251D-470A-A062-FA1922DFA9A8'
ACCEL_PERIOD = 'E95DFB24-251D-470A-A062-FA1922DFA9A8'

BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';
*/
const LED_MATRIX_STATE = "e95d7b77-251d-470a-a062-fa1922dfa9a8";

function onClickStartButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.");
    return;
  }

  requestDevice();
}

function onClickStopButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.");
    return;
  }

  disconnect();
}

function generateUint8Array() {
  let array = new Uint8Array(5);

  for (let row = 0; row < 5; row++) {
    let value = 0;

    for (let index = 0; index < 5; index++) {
      value *= 2;
      if (document.getElementsByName("check" + row + index)[0].checked) {
        value += 1;
      }
    }

    array[row] = value;
  }

  return array;
}

//step1
async function requestDevice() {
  // showModal('Requesting any Bluetooth Device...');

  try {
    if (!targetDevice) {
      targetDevice = await navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        filters: [{ services: [LED_SERVICE] }, { namePrefix: "BBC micro:bit" }]
      });
    }
    await connect(targetDevice);
  } catch (error) {
    showModal(error);
    targetDevice = null;
  }
}

function disconnect() {
  if (targetDevice == null) {
    showModal("target device is null.");
    return;
  }

  targetDevice.gatt.disconnect();
  targetDevice = null;
  ledMatrixStateCharacteristic = null;
}

//step2
async function connect(bluetoothDevice) {
  const server = await bluetoothDevice.gatt.connect();
  await findLedService(server);
}

//step3
async function findLedService(server) {
  const service = await server.getPrimaryService(LED_SERVICE);
  await findLedMatrixStateCharacteristic(service);
}

//step4
async function findLedMatrixStateCharacteristic(service) {
  const characteristic = await service.getCharacteristic(LED_MATRIX_STATE);
  ledMatrixStateCharacteristic = characteristic;
  await ledMatrixStateCharacteristic.writeValue(new Uint8Array(5));
}

//step 5
function onChangeCheckBox() {
  if (ledMatrixStateCharacteristic == null) {
    return;
  }

  ledMatrixStateCharacteristic.writeValue(generateUint8Array()).catch(error => {
    showModal(error);
  });
}

function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
}
