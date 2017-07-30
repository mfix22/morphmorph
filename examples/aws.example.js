/* global dynamo */
/*
 * Example taken from:
 * http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property
 */
const Mapper = require('..')

const mapper = new Mapper()

const params = {
  Key: {
    Artist: {
      S: 'Acme Band'
    },
    SongTitle: {
      S: 'Happy Day'
    }
  },
  TableName: 'Music'
}

const GET_ITEM_MAPPINGS = [
  'Item.Artist.S:song.artist',
  'Item.AlbumTitle.S:song.album',
  'Item.SongTitle.S:song.title'
]

dynamo.getItem(params).promise().then(res => {
  /*
   {
     Item: {
       AlbumTitle: {
         S: "Songs About Life"
       },
       Artist: {
         S: "Acme Band"
       },
       SongTitle: {
         S: "Happy Day"
       }
     }
   }
   */
  return mapper.map(GET_ITEM_MAPPINGS, res)
  /*
   {
     song: {
       album: "Songs About Life"
       artist: "Acme Band"
       title: "Happy Day"
     }
   }
   */
})
