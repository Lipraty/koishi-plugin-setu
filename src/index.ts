import { Context, Schema, h } from 'koishi'
import { } from '@koishijs/plugin-rate-limit'

export const name = 'setu'

export interface Config {
  maxUsage: number
  proxy: string
}

export const Config: Schema<Config> = Schema.object({
  maxUsage: Schema.number().default(10).step(1).description('使用次数限制'),
  proxy: Schema.string().role('link').description('由于 P 站资源域名 i.pximg.net 具有防盗链措施，需要自行指定图片反代地址')
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('setu')
  ctx.i18n.define('zh', require('./locales/zh'))
  ctx.command('setu', { maxUsage: config.maxUsage })
    .option('size', '-s <string>', { fallback: 'original' })
    .option('author', '-a <number>')
    .option('excludeAI', '-A', { fallback: true })
    .action(async ({ session, options }) => {
      if (config.proxy) options['proxy'] = config.proxy
      const loli = await ctx.http('POST', `https://api.lolicon.app/setu/v2`, {
        data: options
      })
      if (loli.data[0].pid as number >= 1) {
        session.send(session.text('.relax'))
        return `<image url="${loli.data[0].urls[options.size]}"/>`
      } else {
        return session.text('.error', loli.error || '参数错误或 API 请求错误')
      }
    })
}
