// tests go here; this will not be compiled when this package is used as an extension.
OKBit.ADC.AnalogInitial();
OKBit.GPIO.GpioInit();
OKBit.PWM.PWMinit();
OKBit.OLED.init();

OKBit.PWM.SetMotorSpeedRaw(0, 500, OKBit.PWM.MotorDirection.Forward)
OKBit.PWM.SetMotorSpeedRaw(1, 500, OKBit.PWM.MotorDirection.Backward)


basic.forever(function() {
    adc_update();
    gpio_update();
    pwm_update();
})


let adc_timestamp_ms = 0;
function adc_update(): void{
    if(control.millis() - adc_timestamp_ms >= 1000){
        for(let i = 0; i < 8 ; i++){
            OKBit.OLED.writeNumNewLine(OKBit.ADC.AnalogReadVoltage(i));
        }
        adc_timestamp_ms = control.millis();
    }
}

let gpio_timestamp_ms = 0;
let gpio_cnt = 0;
function gpio_update(): void{
    if(control.millis() - gpio_timestamp_ms >= 100){
        OKBit.GPIO.GpioWrite(gpio_cnt, OKBit.GPIO.GpioRead(gpio_cnt) ? 0 : 1);
        gpio_cnt = (gpio_cnt+1)% 16;
        gpio_timestamp_ms = control.millis();
    }
}

let pwm_timestamp_ms = 0;
let servo_angle = 0;
let servo_dir = 0;
function pwm_update(): void{
    if(control.millis() - pwm_timestamp_ms >= 1){
        for(let i = 0; i < 8; i++){
            OKBit.PWM.SetServoAngle(i,servo_angle);
        }
        servo_angle += servo_dir ? -1:1 ;

        if(servo_angle >= 180 || servo_angle <= 0){
            servo_dir = 1-servo_dir;
        }
    }
}

