# Command Annotation

> The command annotation tells the Ted client instance that it is, infact
> a command.


### Example:
```ts
import { Command } from '@turel/ted';
 
export default class ExampleCommand
{
  @Command({ name: 'name' })
  public NameExecute(interaction: ChatInputCommandInteraction): any
  {
      // ...
  }
}
 
/// Where ever your client is defined.
Ted#register(ExampleCommand);
```