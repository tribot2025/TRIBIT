

namespace PCA9685 {

    export enum ADDR {
        ADDR_0x40 = 0x40,
        ADDR_0x41,
        ADDR_0x42,
        ADDR_0x43,
        ADDR_0x44,
        ADDR_0x45,
        ADDR_0x46,
        ADDR_0x47,
        ADDR_0x48,
        ADDR_0x49,
        ADDR_0x4A,
        ADDR_0x4B,
        ADDR_0x4C,
        ADDR_0x4D,
        ADDR_0x4E,
        ADDR_0x4F,
        ADDR_0x50,
        ADDR_0x51,
        ADDR_0x52,
        ADDR_0x53,
        ADDR_0x54,
        ADDR_0x55,
        ADDR_0x56,
        ADDR_0x57,
        ADDR_0x58,
        ADDR_0x59,
        ADDR_0x5A,
        ADDR_0x5B,
        ADDR_0x5C,
        ADDR_0x5D,
        ADDR_0x5E,
        ADDR_0x5F,
    }

    const MODE1 = 0x00;
    const  PRESCALE = 0xFE;
    const  LED0_ON_L = 0x06;
    const  ALL_LED_OFF_H = 0xFD;
    let i2cAddr:ADDR;
    
    /**
     * Initialize the PCA9685
     * @param addr I2C address (usually 0x40)
     */
    export function init(addr : ADDR = ADDR.ADDR_0x40): void {
        i2cAddr = addr
        writeRegister(MODE1, 0x00)
        setPWMFreq(50)
    }

    /**
     * Set PWM frequency in Hz (default is 50Hz for servos)
     * @param freq frequency in Hz
     */
    export function setPWMFreq(freq: number): void {
        const prescaleval = 25000000 / (4096 * freq) - 1
        const prescale = Math.floor(prescaleval + 0.5)

        const oldmode = readRegister(MODE1)
        const newmode = (oldmode & 0x7F) | 0x10 // sleep

        writeRegister(MODE1, newmode)           // go to sleep
        writeRegister(PRESCALE, prescale)       // set the prescaler
        writeRegister(MODE1, oldmode)           // wake up
        control.waitMicros(5000)
        writeRegister(MODE1, oldmode | 0xa1)     // auto-increment on
    }

    /**
     * Set PWM pulse for a channel
     * @param channel 0–15
     * @param on 0–4095
     * @param off 0–4095
     */
    //% channel.min=0 channel.max=15
    //% on.min=0 on.max=4095
    //% off.min=0 off.max=4095
    export function setPWM(channel: number, on: number, off: number): void {
        const base = LED0_ON_L + 4 * channel
        const buf = pins.createBuffer(5)
        buf[0] = base
        buf[1] = on & 0xFF
        buf[2] = (on >> 8) & 0xFF
        buf[3] = off & 0xFF
        buf[4] = (off >> 8) & 0xFF
        pins.i2cWriteBuffer(i2cAddr, buf)
    }

    function writeRegister(reg: number, value: number): void {

        const buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(i2cAddr, buf)
    
    }

    function readRegister(reg: number): number {
        pins.i2cWriteNumber(i2cAddr, reg, NumberFormat.UInt8BE)
        return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8BE)
    }
}
