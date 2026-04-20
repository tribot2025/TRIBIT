namespace OKBit{
    export namespace ADC{
        import _ADC = ADC128S102;

        //% subcategory="ADC"
        /**
         * Initialize ADC IC
         */
        //% block="ADC: Initialization"
        //% weight=99
        export function AnalogInitial(): void {
            _ADC.AnalogInitial();
        }

        //% subcategory="ADC"
        /**
         * Read ADC channel and return value
         * 
         * @param ADC channel (0-7)
         * 
         * Return ADC value (0-4095)@12bits
         */
        //% block="ADC: Read $channel pin"
        //% channel.min=0 channel.max=7
        //% group="ADVANCE"
        export function AnalogRead(channel: number): number {
            if(channel >= 5){
                return _ADC.AnalogRead(Math.abs(7-channel)+5);
            }
            return _ADC.AnalogRead(channel);
        }

        //% subcategory="ADC"
        /**
         * Read ADC channel and return voltage
         * 
         * @param ADC channel (0-7)
         * 
         * @returns ADC voltage (0-3.3V)
         */
        //% block="ADC: ReadVoltage $channel pin"
        //% channel.min=0 channel.max=7
        export function AnalogReadVoltage(channel: number): number {
            return AnalogRead(channel)/4096*3.3;
        }
    }
    export namespace GPIO{
        import _GPIO = PCA9555;
        //% subcategory="GPIO"
        /**
         * Initialize GPIO IC
         * 
         * @param I2C address (0x20-0x27)
         */
        //% block="GPIO: Initialization at $address"
        //% weight=99
            export function GpioInit(address: _GPIO.Address = _GPIO.Address.ADDR_0x20): void {
            _GPIO.init(address);
        }

        //% subcategory="GPIO"
        /**
         * Set single pin as INPUT or OUTPUT
         * 
         * @param pin pin number (0-15)
         * @param mode GPIO.PinMode.Input or GPIO.PinMode.Output
         */
        //% block="GPIO: Set $pin pin as $mode"
        //% pin.min=0 pin.max=15
            export function GpioMode(pin: number, mode: _GPIO.PinMode): void {
                _GPIO.config_single_pin(pin, mode);
        }

        //% subcategory="GPIO"
        /**
         * Write single pin as HIGH or LOW
         * 
         * @param pin pin number (0-15)
         * @param value PinOutput.High or PinOutput.Low
         */
        //% block="GPIO: Write $pin pin as $value"
        //% pin.min=0 pin.max=15
            export function GpioWrite(pin: number, value: _GPIO.PinOutput): void {
                _GPIO.write_single_pin(pin, value);
        }

        //% subcategory="GPIO"
        /**
         * @param pin pin number (0-15)
         */
        //% block="GPIO: Read $pin pin"
        //% pin.min=0 pin.max=15
        export function GpioRead(pin: number): number {
            return _GPIO.read_single_pin(pin);
        }
    }

    export namespace PWM{
        import _PWM = PCA9685;

        //% subcategory="PWM"
        /**
         * Initialize the PWM module
         * @param addr I2C address (usually 0x40)
         */
        //% block="PWM: Initialize at address %addr"
        //% weight=99
        export function PWMinit(addr: _PWM.ADDR = _PWM.ADDR.ADDR_0x40): void {
            _PWM.init(addr)
        }

        //% subcategory="PWM"
        /**
         * Set PWM frequency in Hz (default is 50Hz for servos)
         * @param freq frequency in Hz
         */
        //% block="PWM: Set frequency $freq Hz"
        //% group="ADVANCE"
        export function setPWMFreq(freq: number = 50): void {
            _PWM.setPWMFreq(freq);
        }

        //% subcategory="PWM"
        /**
         * Set PWM pulse for a channel
         * @param channel 0–15
         * @param on 0–4095
         * @param off 0–4095
         */
        //% block="PWM: Set output channel $channel|on $on|off $off"
        //% channel.min=0 channel.max=15
        //% on.min=0 on.max=4095
        //% off.min=0 off.max=4095
        //% group="ADVANCE"
        export function SetPWMRaw(channel: number, on: number, off: number): void {
            _PWM.setPWM(channel, on, off);
        }

        //% subcategory="PWM"
        /**
         * Set PWM pulse for a channel
         * @param channel 0–15
         * @param duty 0–100
         */
        //% block="PWM: Set output channel $channel|duty $duty"
        //% channel.min=0 channel.max=15
        //% duty.min=0 duty.max=100
        export function SetPWM(channel: number, duty: number): void {
            SetPWMRaw(channel,0,duty*4095/100);
        }

        //% subcategory="PWM"
        /**
         * Set servo angle (0–180°)
         * @param channel 0–7
         * @param angle 0–180°
         */
        //% block="PWM: Set Servo $channel|angle $angle"
        //% channel.min=0 channel.max=7
        //% angle.min=0 angle.max=180
        export function SetServoAngle(channel: number, angle: number): void {
            const pulse = Math.map(angle, 0, 180, 102, 512) // ~0.5ms to 2.5ms pulse @50Hz
            _PWM.setPWM(channel, 0, pulse)
        }

        export enum MotorDirection {
            Forward = 0,
            Backward
        }

        //% subcategory="PWM"
        /**
         * Set motor speed (0–100)
         * @param channel 0–3
         * @param speed 0–100
         * @param direction MotorDirection.Forward/Backward
         */
        //% block="PWM: Set Motor $channel|speed $speed|direction $direction"
        //% channel.min=0 channel.max=3
        //% speed.min=0 speed.max=100
        export function SetMotorSpeed(channel: number, speed: number, direction: MotorDirection = MotorDirection.Forward): void {
            SetMotorSpeedRaw(channel,speed*4095/100,direction);
        }

        //% subcategory="PWM"
        /**
         * Set motor speed (0–4095)
         * @param channel 0–3
         * @param speed 0–4095
         * @param direction MotorDirection.Forward/Backward
         */
        //% block="PWM: Set Motor $channel|speed $speed|direction $direction"
        //% channel.min=0 channel.max=3
        //% speed.min=0 speed.max=4095
        //% group="ADVANCE"
        export function SetMotorSpeedRaw(channel: number, speed: number, direction: MotorDirection = MotorDirection.Forward): void {
            let channelA, channelB
            switch (channel) {
                case 0: channelA = 15; channelB = 14; break;
                case 1: channelA = 13; channelB = 12; break;
                case 2: channelA = 11; channelB = 10; break;
                case 3: channelA = 9; channelB = 8; break;
            }

            SetPWMRaw(channelA, 0, direction == MotorDirection.Forward ? 0 : speed);
            SetPWMRaw(channelB, 0, direction == MotorDirection.Forward ? speed : 0);
        }
    }
}
