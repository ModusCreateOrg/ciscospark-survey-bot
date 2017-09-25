import test from 'ava'

import testExamples from '../../helpers/testExamples'

import { parseDomainList, emailsAreWithinDomains, emailDomain } from '../../../src/webui/auth/helpers'

testExamples('parseDomainList',
  (t, givenDomainListString, expectedDomainListArray) => {
    t.deepEqual(parseDomainList(givenDomainListString), expectedDomainListArray)
  },
  ['', []],
  [' ', []],
  [undefined, []],

  ['a.com', ['a.com']],
  ['a.com,b.com', ['a.com', 'b.com']],
  [' a.com , b.com ', ['a.com', 'b.com']],
  [' a.com ,', ['a.com']],
)

testExamples('emailDomain',
  (t, email, expectedDomain) => {
    t.true(emailDomain(email) == expectedDomain)
  },
  ['a@a.com', 'a.com'],
  ['a@a.b.com', 'a.b.com'],
  ['a@a.x', 'a.x'],
  ['a@sdfsdf!@@a.x', 'a.x'],
)

testExamples('parseDomainList',
  (t, [emails, domains], expectedResult) => {
    t.deepEqual(emailsAreWithinDomains(emails, domains), expectedResult)
  },
  [[ [], [] ], false],
  [[ [], ['b.com'] ], false],
  [[ ['bob@a.com'], ['b.com'] ], false],
  [[ ['bob@a.com'], ['aa.com'] ], false],
  [[ ['bob@a.com'], ['b.com', 'c.com'] ], false],
  [[ ['bob@a.b.com'], ['b.com', 'c.com'] ], false],

  [[ ['bob@a.com'], [] ], true],
  [[ ['bob@a.com', 'bob@b.com'], [] ], true],
  [[ ['bob@a.com'], ['a.com'] ], true],
  [[ ['bob@a.com', 'bob@b.com'], ['a.com'] ], true],
  [[ ['bob@a.com', 'bob@b.com'], ['b.com'] ], true],
  [[ ['bob@b.com'], ['a.com', 'b.com'] ], true],
  [[ ['bob@a.com', 'bob@b.com'], ['a.com', 'b.com'] ], true],
  [[ ['bob@a.com', 'bob@b.com'], ['b.com', 'a.com'] ], true],
)
