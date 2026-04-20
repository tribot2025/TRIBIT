/*
This code is derived from:
https://github.com/SolderedElectronics/pxt-wifi/tree/master

MIT License

Copyright 2019 E-radionica

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    CONNECT,
    TRACE
}

enum Newline {
    CRLF,
    LF,
    CR
}

namespace OKBit{
    /**
     * WiFi:bit commands.
     */
    export namespace Blynk{
    function writeToSerial(data: string, waitTime: number): void {
        serial.writeString(data + "\u000D" + "\u000A")
        if (waitTime > 0) {
            basic.pause(waitTime)
        }
    }

    let pauseBaseValue: number = 10

    //% subcategory="Blynk"
    /**
     * Change HTTP method wait period.
     * @param newPauseBaseValue Base value, eg: 1000
     */
    //% weight=1
    export function changeHttpMethodWaitPeriod(newPauseBaseValue: number): void {
        pauseBaseValue = newPauseBaseValue
    }

    //% subcategory="Blynk"
    /**
     * Make a serial connection between micro:bit and ESP8266.
     */
    //% weight=100
    //% blockId="wfb_connect" block="connect to ESP8266"
    export function connectToEsp8266(): void {
        serial.redirect(
            SerialPin.P0,
            SerialPin.P1,
            BaudRate.BaudRate115200
        )
        basic.pause(100)
        // Restart module:
        writeToSerial("AT+RST", 2000)
        // WIFI mode = Station mode (client):
        writeToSerial("AT+CWMODE=1", 5000)
    }

    //% subcategory="Blynk"
    /**
     * Connect to WiFi network.
     * @param ssid SSID, eg: "SSID"
     * @param key Key, eg: "key"
     */
    //% weight=99
    //% blockId="wfb_wifi_on" block="connect to WiFi network %ssid, %key"
    export function connectToWiFiNetwork(ssid: string, key: string): void {
        // Connect to AP:
        writeToSerial("AT+CWJAP=\"" + ssid + "\",\"" + key + "\"", 6000)
    }

    //% subcategory="Blynk"
    /**
     * Disconnect from WiFi network.
     */
    //% weight=98
    //% blockId="wfb_wifi_off" block="disconnect from WiFi network"
    export function disconnectFromWiFiNetwork(): void {
        // Disconnect from AP:
        writeToSerial("AT+CWQAP", 6000)
    }

    //% subcategory="Blynk"
    /**
     * Execute AT command.
     * @param command AT command, eg: "AT"
     * @param waitTime Wait time after execution, eg: 1000
     */
    //% weight=97
    //% blockId="wfb_at" block="execute AT command %command and then wait %waitTime ms"
    //% group="ADVANCE"
    export function executeAtCommand(command: string, waitTime: number): void {
        writeToSerial(command, waitTime)
    }

    //% subcategory="Blynk"
    /**
     * Execute HTTP method.
     * @param method HTTP method, eg: HttpMethod.GET
     * @param host Host, eg: "google.com"
     * @param port Port, eg: 80
     * @param urlPath Path, eg: "/search?q=something"
     * @param headers Headers
     * @param body Body
     */
    //% weight=96
    //% blockId="wfb_http" block="execute HTTP method %method|host: %host|port: %port|path: %urlPath||headers: %headers|body: %body"
    //% group="ADVANCE"
    export function executeHttpMethod(method: HttpMethod, host: string, port: number, urlPath: string, headers?: string, body?: string): void {
        let myMethod: string
        switch (method) {
            case HttpMethod.GET: myMethod = "GET"; break;
            case HttpMethod.POST: myMethod = "POST"; break;
            case HttpMethod.PUT: myMethod = "PUT"; break;
            case HttpMethod.HEAD: myMethod = "HEAD"; break;
            case HttpMethod.DELETE: myMethod = "DELETE"; break;
            case HttpMethod.PATCH: myMethod = "PATCH"; break;
            case HttpMethod.OPTIONS: myMethod = "OPTIONS"; break;
            case HttpMethod.CONNECT: myMethod = "CONNECT"; break;
            case HttpMethod.TRACE: myMethod = "TRACE";
        }
        // Establish TCP connection:
        let data: string = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, pauseBaseValue * 6)
        data = myMethod + " " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A"
        if (headers && headers.length > 0) {
            data += headers + "\u000D" + "\u000A"
        }
        if (data && data.length > 0) {
            data += "\u000D" + "\u000A" + body + "\u000D" + "\u000A"
        }
        data += "\u000D" + "\u000A"
        // Send data:
        writeToSerial("AT+CIPSEND=" + (data.length + 2), pauseBaseValue * 3)
        writeToSerial(data, pauseBaseValue * 6)
        // Close TCP connection:
        writeToSerial("AT+CIPCLOSE", pauseBaseValue * 3)
    }

    //% subcategory="Blynk"
    /**
     * Write Blynk pin value.
     * @param value Value, eg: "510"
     * @param pin Pin, eg: "A0"
     * @param auth_token Token, eg: "14dabda3551b4dd5ab46464af582f7d2"
     */
    //% weight=95
    //% blockId="wfb_blynk_write" block="Blynk: write %value to %pin, token is %auth_token"
    //% group="ADVANCE"
    export function writeBlynkPinValue(value: string, pin: string, auth_token: string): void {
        executeHttpMethod(
            HttpMethod.GET,
            "blynk-cloud.com",
            80,
            "/" + auth_token + "/update/" + pin + "?value=" + value
        )
    }

    //% subcategory="Blynk"
    /**
     * Read Blynk pin value.
     * @param pin Pin, eg: "A0"
     * @param auth_token Token, eg: "14dabda3551b4dd5ab46464af582f7d2"
     */
    //% weight=94
    //% blockId="wfb_blynk_read" block="Blynk: read %pin, token is %auth_token"
    //% group="ADVANCE"
    export function readBlynkPinValue(pin: string, auth_token: string): string {
        executeAtCommand("ATE0", 1000)
        let response: string
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            response += serial.readString()
        })
        executeHttpMethod(
            HttpMethod.GET,
            "blynk-cloud.com",
            80,
            "/" + auth_token + "/get/" + pin
        )
        let value: string = response.substr(response.indexOf("[") + 2, response.indexOf("]") - response.indexOf("[") - 3)
        response = null
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => { })
        return value
    }

    //% subcategory="Blynk"
    /**
     * Write Blynk IoT pin value.
     * @param value Value, eg: "1"
     * @param pin Pin, eg: "V1"
     * @param auth_token Token, eg: "BzMEzpZ9Bud9ZUXZoJVEkbfneCavDVDx"
     */
    //% weight=93
    //% blockId="wfb_blynk_iot_write" block="Blynk IoT: write %value to %pin, token is %auth_token"
    export function writeBlynkIoTPinValue(value: string, pin: string, auth_token: string): void {
        executeHttpMethod(
            HttpMethod.GET,
            "blynk.cloud",
            80,
            "/external/api/update?token=" + auth_token + "&" + pin + "=" + value
        )
    }

    //% subcategory="Blynk"
    /**
     * Read Blynk IoT pin value.
     * @param pin Pin, eg: "V1"
     * @param auth_token Token, eg: "BzMEzpZ9Bud9ZUXZoJVEkbfneCavDVDx"
     */
    //% weight=92
    //% blockId="wfb_blynk_iot_read" block="Blynk IoT: read %pin, token is %auth_token"
    export function readBlynkIoTPinValue(pin: string, auth_token: string): string {
        executeAtCommand("ATE0", 1000)
        let response: string
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            response += serial.readString()
        })
        executeHttpMethod(
            HttpMethod.GET,
            "blynk.cloud",
            80,
            "/external/api/get?token=" + auth_token + "&v-1&" + pin
        )
        let value: string = response.substr(response.indexOf("{\"" + pin + "\":") + 2 + pin.length + 2, response.indexOf("}") - response.indexOf("{\"" + pin + "\":") - 2 - pin.length - 2).replaceAll("\"", "")
        response = null
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => { })
        return value
    }

    //% subcategory="Blynk"
    /**
     * Line separator. It's used when headers or body are multiline.
     */
    //% weight=91
    //% blockId="wfb_crlf" block="CRLF"
    //% group="ADVANCE"
    export function newline(): string {
        return "\u000D" + "\u000A"
    }
    }
}