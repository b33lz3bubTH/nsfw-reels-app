import { CommandConfig } from './manager';


export const Commands = {
  consume_media: '/consume media',
  consume_list: '/consume list',
  whois_user: '/whois user',
};

export const appCommandConfigs: CommandConfig[] = [
  {
    name: Commands.consume_media,
    args: [
      { name: 'UUID', type: 'string' },
    ],
  },
  {
    name: Commands.whois_user,
    args: [
      { name: 'UUID', type: 'UUID' },
    ],
  },
  {
    name: Commands.consume_list,
    args: [
      { name: 'take', type: 'number' },
      { name: 'skip', type: 'number', optional: true },
    ],
  },
];

