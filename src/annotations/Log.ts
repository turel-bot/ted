import Logger from 'src/utils/Logger';
import type Ted from '../structures/Ted';

function Log(owner: Ted)
{
    return function (_: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor
    {
        const targetMethod = descriptor.value;

        descriptor.value = function (...args: any[])
        {
            if(!owner.debug)
                return targetMethod.call(this, args);

            const logger = Logger.getInstance();
            logger.info(`ted instance using ID of \`${ owner.user?.id }\``);
            logger.info(`Called ${ propertyKey } @ ${ Date.now() }`);
            logger.info(`Arguments of ${ args }`);

            return targetMethod.call(this, args);
        };

        return descriptor;
    };
}

export default Log;