require('dotenv').config()
const mongoose = require('mongoose')

// The Atlas cluster host and the database username come from the (git-ignored)
// .env file. The password is NOT stored anywhere: it is the first command-line argument.
const CLUSTER_HOST = process.env.MONGODB_HOST
const USERNAME = process.env.MONGODB_USERNAME

if (!CLUSTER_HOST || !USERNAME) {
  console.log('set MONGODB_HOST and MONGODB_USERNAME in .env (see .env.example)')
  process.exit(1)
}

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const url = `mongodb+srv://${USERNAME}:${password}@${CLUSTER_HOST}/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    console.log('phonebook:')
    persons.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('usage: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}
