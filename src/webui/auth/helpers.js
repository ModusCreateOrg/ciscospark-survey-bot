import some from 'lodash/some'
import includes from 'lodash/includes'

export const emailDomain = email => email.replace(/.*@/, '')

export const emailsAreWithinDomains = (emails, domains) =>
  emails.length !== 0 && (
    domains.length === 0 ||
    some(emails, email => includes(domains, emailDomain(email)))
  )

export const parseDomainList = str =>
  (str || '').split(',').map(s=>s.trim()).filter(s=>s)
