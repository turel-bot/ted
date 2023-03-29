import type Ted from '../structures/Ted';

function Log(owner: Ted)
{
    return function (_: unknown, __: string, descriptor: PropertyDescriptor): PropertyDescriptor
    {
        const targetMethod: (...args: any[]) => any = descriptor.value;

        descriptor.value = function (...args: any[])
        {
            // https://stackoverflow.com/questions/2648293/how-to-get-the-function-name-from-within-that-function
            const funcName: RegExpExecArray | null = /^function\s+([\w\$]+)\s*\(/.exec(targetMethod.toString());
            const validFuncName: string = funcName ? funcName[1] : 'N/A';
            owner.emit(
                'debug',
                `called function "${ validFuncName }" 
                with arguments of "${ args.toString() }" at ${ new Date().toDateString() }`);

            return targetMethod.call(this, args);
        };

        return descriptor;
    };
}

export default Log;