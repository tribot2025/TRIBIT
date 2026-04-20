namespace ADC128S102 {

    // ----------------------- ADC128S102 -----------------------

    let spi_mosi = DigitalPin.P15;
    let spi_miso = DigitalPin.P14;
    let spi_sck = DigitalPin.P13;
    let spi_cs = DigitalPin.P16;
    
    let ref_voltage = 3.3;

    //% blockId = ADC_INIT
    export function AnalogInitial(): void {
        pins.spiPins(spi_mosi, spi_miso, spi_sck);
        pins.spiFormat(8, 3);
        pins.spiFrequency(14000000);

        pins.digitalWritePin(spi_cs, 1);
    }

    //% blockId=ADC_READ
    export function AnalogRead(channel: number): number {
        
        // DONTC DONTC ADDR2 ADDR1 ADDR0 DONTC DONTC DONTC
        let buffer = pins.createBuffer(2);
        let response = pins.createBuffer(2);
        buffer[0] = 0x00 | (channel << 3);
        buffer[1] = 0x00;

        pins.digitalWritePin(spi_cs, 0);
        control.waitMicros(10);
        pins.spiTransfer(buffer, null);
        pins.digitalWritePin(spi_cs, 1);

        control.waitMicros(10);
        pins.digitalWritePin(spi_cs,0);
        control.waitMicros(10);
        pins.spiTransfer(buffer,response);
        pins.digitalWritePin(spi_cs,1);

        control.waitMicros(10);

        // return (high_byte << 8) | low_byte;
        return response[0]<<8 | response[1]
    }

    //% blockId=ADC_READ_VOLTAGE
    export function AnalogReadVoltage(channel: number): number{
        let voltage = AnalogRead(channel)/4096*ref_voltage;
        return voltage
    }

}