namespace PCA9555{

    export enum Address{
        ADDR_0x20 = 0x20,
        ADDR_0x21,
        ADDR_0x22,
        ADDR_0x23,
        ADDR_0x24,
        ADDR_0x25,
        ADDR_0x26,
        ADDR_0x27
    }

    enum Command{
        input_port0 = 0,
        input_port1,
        output_port0,
        output_port1,
        polar_invert_port0,
        polar_inver_port1,
        config_port0, // 1 = input, 0 = output
        config_port1
    }

    export enum PinMode{
        Output = 0,
        Input
    }

    export enum PinOutput{
        Low = 0,
        High
    }

    let i2c_address = 0x20;

    let port0_mode = 0x00, port1_mode = 0x00;
    let port0_output = 0x00, port1_output = 0x00;

    function write_register(register:number, value:number): void{

        let buffer = pins.createBuffer(2);
        buffer[0] = register;
        buffer[1] = value;

        pins.i2cWriteBuffer(i2c_address,buffer);
        
    }

    function read_register(register:number):number{
        pins.i2cWriteNumber(i2c_address,register,NumberFormat.UInt8LE);
        return pins.i2cReadNumber(i2c_address,NumberFormat.UInt8LE);
    }

    export function init(address: Address):void{
        i2c_address = address;
        config_all_pin(Command.config_port0, 0x00); // set all pin as output
        config_all_pin(Command.config_port1, 0x00); // set all pin as output
        write_all_pin(Command.output_port0,0x00); // write all pin as low
        write_all_pin(Command.output_port1, 0x00); // write all pin as low

    }
    export function config_all_pin(port:Command, pin_byte:number):void{
        write_register(port, pin_byte);
    }

    export function config_single_pin(pin:number, mode:PinMode):void{
        if(pin < 8){
            port0_mode = (port0_mode & ~(1<<pin)) | (mode<<pin);
            config_all_pin(Command.config_port0, port0_mode)
        }
        else{
            pin = pin-8;
            port1_mode = (port1_mode & ~(1<<pin)) | (mode<<pin);
            config_all_pin(Command.config_port1, port1_mode)
        }
    }

    export function write_all_pin(port:Command, pin_byte:number):void{
            write_register(port,pin_byte);
    }

    export function write_single_pin(pin:number, output:PinOutput):void{
        if (pin < 8) {
            port0_output = (port0_output & ~(1 << pin)) | (output << pin);
            write_all_pin(Command.output_port0,port0_output);
        }
        else {
            pin = pin - 8;
            port1_output = (port1_output & ~(1 << pin)) | (output << pin);
            write_all_pin(Command.output_port1, port1_output);
        }
    }

    export function read_all_pin(port:Command):number{
        return read_register(port);
    }

    export function read_single_pin(pin:number):number{
        if(pin < 8){
            // if( ((port0_mode>>pin)&0b1) == PinMode.Output ){
            //     return -1;
            // }
            return (read_all_pin(Command.input_port0)>>pin)&0b1;
        }
        else{
            pin = pin-8;
            // if (((port1_mode >> pin) & 0b1) == PinMode.Output) {
            //     return -1;
            // }
            return (read_all_pin(Command.input_port1)>>pin)&0b1;
        }
    }

}