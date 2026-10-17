const mongoose = require('mongoose')

// Host of your MongoDB Atlas cluster, e.g. cluster0.a5qfl.mongodb.net
// (copy it from the connection string shown in Atlas). The password is NOT
// stored here: it is given as the first command-line argument.
const CLUSTER_HOST = 'your-cluster.mongodb.net'

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const url = `mongodb+srv://fullstack:${password}@${CLUSTER_HOST}/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

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
