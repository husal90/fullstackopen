import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const existing = persons.find(person => person.name === newName)

    if (existing) {
      const message =
        `${newName} is already added to phonebook, replace the old number with a new one?`

      if (window.confirm(message)) {
        const changedPerson = { ...existing, number: newNumber }

        personService
          .update(existing.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id === existing.id ? returnedPerson : p))
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            alert(`Information of ${existing.name} has already been removed from server`)
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
  }

  const removePerson = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== person.id))
        })
        .catch(() => {
          alert(`Information of ${person.name} has already been removed from server`)
          setPersons(persons.filter(p => p.id !== person.id))
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter value={filter} onChange={(event) => setFilter(event.target.value)} />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={(event) => setNewName(event.target.value)}
        newNumber={newNumber}
        onNumberChange={(event) => setNewNumber(event.target.value)}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} onDelete={removePerson} />
    </div>
  )
}

export default App
