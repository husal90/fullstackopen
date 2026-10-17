import Person from './Person'

const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map(person => (
      <Person
        key={person.id}
        person={person}
        onDelete={() => onDelete(person)}
      />
    ))}
  </div>
)

export default Persons
