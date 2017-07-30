/* global slack */
/*
 * Example taken from:
 * https://api.slack.com/methods/users.info
 */
const Mapper = require('..')

const mapper = new Mapper()

const GET_USER_MAPPINGS = [
  'user.id:id',
  { field: 'user.color:hexColor', type: color => `#${color}` },
  'user.profile.real_name:name',
  'user.profile.email:email',
  {
    field: 'user.profile.phone:phoneNumber',
    type: [Number, field => field.replace(/\D/g, '')]
  },
  {
    field: 'user.is_admin:accessLevel',
    type: (b, mapping, options, curr) =>
      1 + Number(b) + Number(curr.user.is_owner)
  },
  { field: 'user.updated:lastUpdatedDateTime', type: v => Date(v).valueOf() },
  { field: 'isSlackUser', type: () => true } // Always set this field to true
]

slack.user.info().then(res => {
  /*
  {
    ok: true,
    user: {
      id: "U023BECGF",
      name: "bobby",
      deleted: false,
      color: "9f69e7",
      profile: {
          avatar_hash: "ge3b51ca72de",
          current_status: ":mountain_railway: riding a train",
          first_name: "Bobby",
          last_name: "Tables",
          real_name: "Bobby Tables",
          tz: "America\/Los_Angeles",
          tz_label: "Pacific Daylight Time",
          tz_offset: -25200,
          email: "bobby@slack.com",
          skype: "my-skype-name",
          phone: "+1 (123) 456 7890",
          image_24: "https:\/\/...",
          image_32: "https:\/\/...",
          image_48: "https:\/\/...",
          image_72: "https:\/\/...",
          image_192: "https:\/\/..."
      },
      is_admin: true,
      is_owner: true,
      updated: 1490054400,
      has_2fa: true
    }
  }
  */
  return mapper.map(GET_USER_MAPPINGS, res)
  /*
  {
    id: "U023BECGF",
    name: "Bobby Tables",
    color: "#9f69e7",
    accessLevel: 3,
    email: "bobby@slack.com",
    phoneNumber: 11234567890
    lastUpdatedDateTime: "Sun Jul 30 2017 13:47:08 GMT-0700 (PDT)",
    isSlackUser: true
  }
  */
})
