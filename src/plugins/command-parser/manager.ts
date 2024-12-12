export interface CommandConfig {
  name: string;
  args: Array<{
    name: string;
    type: 'string' | 'number' | 'UUID';
    optional?: boolean;
  }>;
}

export class CommandParser {
  constructor(private configs: CommandConfig[]) { }

  parse(input: string) {
    console.log(`[CommandParser] Parsing input: "${input}"`);
    console.log(`[+] configs:`, this.configs);

    // Find the matching command
    const config = this.configs.find((c) => input.startsWith(c.name));
    if (!config) {
      console.error(`[CommandParser] Unknown command in input: "${input}"`);
      throw new Error(`Unknown command: ${input}`);
    }

    console.log(`[CommandParser] Matched command: "${config.name}"`);

    // Extract arguments string
    const argsString = input.slice(config.name.length).trim();
    console.log(`[CommandParser] Extracted args string: "${argsString}"`);

    const args = argsString.split(/\s+/).filter(Boolean);
    console.log(`[CommandParser] Extracted args:`, args);

    const result: Record<string, any> = { command: config.name };
    const expectedArgs = config.args;

    expectedArgs.forEach((arg, index) => {
      const value = args[index];
      if (!value && !arg.optional) {
        throw new Error(`Missing required argument: ${arg.name}`);
      }

      if (value) {
        switch (arg.type) {
          case 'number':
            if (isNaN(Number(value))) {
              throw new Error(`Argument ${arg.name} must be a number.`);
            }
            result[arg.name] = Number(value);
            break;
          case 'UUID':
            const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
            if (!uuidRegex.test(value)) {
              throw new Error(`Argument ${arg.name} must be a valid UUID.`);
            }
            result[arg.name] = value;
            break;
          default:
            result[arg.name] = value;
        }
      }
    });

    console.log(`[CommandParser] Parsed command result:`, result);
    return result;
  }

}
