(function() {
  "use strict";

  document.addEventListener("DOMContentLoaded", event => {
    let connectButton = document.querySelector("#connect");
    let temp = document.querySelector("#temp");
    let statusDisplay = document.querySelector("#status");
    let port;
    let value, valueTradcPos, valueTradcVol;

    async function connect() {
      try {
        await port.connect();
        statusDisplay.textContent = "";
        connectButton.textContent = "Disconnect";

        port.onReceive = data => {
          let textDecoder = new TextDecoder();
          value = textDecoder.decode(data) + "";

          if (value.includes("Pos")) {
            valueTradcPos = value.substr(3, value.length - 1);
            temp.setAttribute("value", valueTradcPos.charCodeAt().toString());
          }
        };

        port.onReceiveError = error => {
          console.error(error);
        };

        if (port != null) {
          let textEncoder = new TextEncoder();
          setInterval(function() {
            port.send(textEncoder.encode("P"));
          }, 500);
        }
      } catch (error) {
        statusDisplay.textContent = error;
      }
    }

    function onUpdate() {
      if (!port) {
        return;
      }
    }

    connectButton.addEventListener("click", async function() {
      if (port) {
        port.disconnect();
        connectButton.textContent = "Connect";
        statusDisplay.textContent = "";
        port = null;
      } else {
        try {
          port = await serial.requestPort();
          await connect();
        } catch (error) {
          statusDisplay.textContent = error;
        }
      }
    });

    serial.getPorts().then(ports => {
      if (ports.length == 0) {
        statusDisplay.textContent = "No device found.";
      }
    });
  });
})();
