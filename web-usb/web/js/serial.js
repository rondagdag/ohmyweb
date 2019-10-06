var serial = {};

(function() {
  "use strict";

  //step 1
  serial.getPorts = async function() {
    let devices = await navigator.usb.getDevices();
    return devices.map(device => new serial.Port(device));
  };

  //step 2
  serial.requestPort = async function() {
    const filters = [
      { vendorId: 0x2341, productId: 0x8036 } //Arduino Leonardo
    ];
    let device = await navigator.usb.requestDevice({ filters: filters });
    return new serial.Port(device);
  };

  serial.Port = function(device) {
    this.device_ = device;
  };

  //step 3
  serial.Port.prototype.connect = async function() {

    await this.device_.open(); // Begin a session.
    if (this.device_.configuration === null) {
      await this.device_.selectConfiguration(1); // Select configuration #1 for the device.
    }
    await this.device_.claimInterface(2); // Request exclusive control over interface #2.
    await this.device_.selectAlternateInterface(2, 0);
    await this.device_.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: 0x22,
      value: 0x01,
      index: 0x02
    }); // Ready to receive data

    // step 4
    let readLoop = async () => {
      // Waiting for 64 bytes of data from endpoint #5.
      try {
        let result = await this.device_.transferIn(5, 64);
        this.onReceive(result.data);
        readLoop();
      } catch (error) {
        this.onReceiveError(error);
      }
    };
    
    readLoop();
  };

  //step 5
  serial.Port.prototype.send = function(data) {
    return this.device_.transferOut(4, data);
  };

  //step 6
  serial.Port.prototype.disconnect = async function() {
    await this.device_.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: 0x22,
      value: 0x00,
      index: 0x02
    });
    return this.device_.close();
  };
})();
