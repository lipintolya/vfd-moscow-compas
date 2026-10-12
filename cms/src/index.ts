import type { Core } from '@strapi/strapi'
import { applyLabels } from './bootstrap/labels'
import { grantEditor, ensureSiteToken, ensureDevWebhook } from './bootstrap/access'
import { registerPublishChecks } from './bootstrap/publish-checks'

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registerPublishChecks(strapi)
  },
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyLabels(strapi)
    await grantEditor(strapi)
    await ensureSiteToken(strapi)
    await ensureDevWebhook(strapi)
  },
}
