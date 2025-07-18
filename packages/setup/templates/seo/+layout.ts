import { metaLoad } from '@opensky/seo'

export const load = metaLoad.layout({
  sitename: 'Luxo Starter',
  icon: './favicon.png',
  title: 'Luxo',
  titleTemplate: { route: '/', template: 'Luxo - {page}' },
  description: 'Get your SvelteKit site off to a running start with @opensky/setup',
})
