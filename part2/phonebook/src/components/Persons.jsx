import Person from './Person'

const Persons = ({ persons }) => (
  <div>
    {persons.map(person => (
      <Person key={person.id} person={person} />
    ))}
  </div>
)

export default Persons
