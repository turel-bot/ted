# Log Annotation

> The Log annotation takes a Ted instance and provides smart logging
> (client id, time, func, args) for debugging purposes. This does not
> serve as an alternative to using Client#on('debug', ...);

## Example:
```ts
class ExampleClazz
{
    @Logger(TedInstance)
    public thing(): void
    {
        return;
    }
}

// OUTPUT:
// [INFO]: ted instance using id of `ID`
// [INFO]: Called thing @ 1675765234812
// [INFO]: Arguments of null (would be the args passed to #thing)
```