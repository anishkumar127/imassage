// import

import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'

import mongoData from './mongoData.js'
// app config

const app = express()

const PORT = process.env.PORT || 3000;


//middleware

app.use(cors());
app.use(express.json());


// db config

const mongoURI = 'mongodb+srv://anishkumar:anishking@cluster0.ybty6.mongodb.net/imessageDB?retryWrites=true&w=majority'

mongoose.connect(mongoURI, {
     useCreateIndex: true,
     useNewUrlParser: true,
     useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
     console.log('Db connected')
})

// api routes
app.get('/', (req, res) => {
     res.status(200).send('anish kumar')
});



app.post('/new/conversation', (req, res) => {
     const dbData = req.body

     mongoData.create(dbData, (err, data) => {
          if (err) {
               res.status(500).send(err)
          } else {
               res.status(201).send(data)
          }
     })
})


app.post('/new/message', (req, res) => {
     mongoData.update({ _id: req.query.id },
          { $push: { conversation: req.body } }, (err, data) => {
               if (err) {
                    console.log('Error saving message....')
                    console.log(err);
                    res.status(500).send(err);

               } else {
                    res.status(201).send(data);
               }
          }
     )

});

app.get('/get/conversationList', (req, res) => {
     mongoData.find((err, data) => {
          if (err) {
               res.status(500).send(err)
          } else {
               data.sort((b, a) => {
                    return a.timestamp - b.timestamp;
               });
               let conversations = []

               data.map((conversationoData) => {
                    const conversationInfo = {
                         id: conversationData._id,
                         name: conversationData.chatName,
                         timestamp: conversationData.conversation[0].timestamp
                    }
                    conversations.push(conversationInfo)
               })
               res.status(200).send(conversations)
          }
     })

})


app.get('/get/conversation', (req, res) => {
     const id = req.query.id
     mongoData.find({ _id: id }, (err, data) => {
          if (err) {
               res.status(500).send(err)
          } else {
               res.status(200).send(data)
          }
     })
})

app.get('get/lastMessage', (req, res) => {
     const id = req.query.id
     mongoData.find({ _id: id }, (err, data) => {
          if (err) {
               res.status(500).send(err)
          } else {
               let convData = data[0].conversation;
               convData.sort((b, a) => {
                    return a.timestamp - b.timestamp;
               })
               res.status(200).send(convData[0])
          }
     })
})
// listen
app.listen(PORT, () => {
     console.log(`server running localhost:${PORT}`)
})