# Ted Client

> The Ted Client extends from a typical Discord.JS Client, and provides
> some extra functionality.


## Registers
Any <code>#register(THING)</code> function allows for you to register class(es) with <code>Command</code> annotated methods.
These work by creating a new instance of the class, which applies our metadata to the method. From there, we 
loop over all the methods avaiable on the class instance **(THIS DOES NOT INCLUDE INHERITED METHODS)** 
and map them in our <code>Commands</code> collection to be used as a command. 

## Events
The `Ted` Client uses the `interactionCreate` event to register our own command handler. If you would like to override this,
just use the `client#on` method, as we override it and remove our listener if you are trying to listen to `interactionCreate`.
We remap any of the `interactions` which are passed to `tedInteractionCreate` which will include everything **OTHER THAN**
`ChatInputCommandInteraction`.

